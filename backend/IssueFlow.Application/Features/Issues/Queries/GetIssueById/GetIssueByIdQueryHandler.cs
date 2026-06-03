using IssueFlow.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

// Bu Handler'ın işi: frontend "/issues/{id}" istediğinde DB'den o issue'yu bulup IssueDetailDto'ya dönüştürmek.
// Akış: Frontend istek atar → Controller → MediatR → bu Handler → DB sorgusu → DTO döner → frontend alır.
//
// Include() nedir?
//   Issue tablosunda HotelId, AssignedUserId, CreatedByUserId sadece ID olarak tutulur (foreign key).
//   Include() ile EF Core o ID'lere karşılık gelen satırları JOIN ile çeker.
//   Include olmasa: issue.Hotel → null, issue.CreatedByUser → null, isim göremeyiz.
//
// DTO dönüşümü: DB'den gelen Issue entity'sini frontend'in anlayacağı IssueDetailDto'ya map ediyoruz.
//   issue.CreatedByUser?.Name → "?" çünkü eski issue'larda CreatedByUserId olmayabilir (null-safe).

namespace IssueFlow.Application.Features.Issues.Queries.GetIssueById;

public class GetIssueByIdQueryHandler : IRequestHandler<GetIssueByIdQuery, IssueDetailDto>
{
    private readonly IApplicationDbContext _db;

    public GetIssueByIdQueryHandler(IApplicationDbContext db) { _db = db; }

    public async Task<IssueDetailDto> Handle(GetIssueByIdQuery request, CancellationToken cancellationToken)
    {
        var issue = await _db.Issues
            .Include(i => i.Hotel)
            .Include(i => i.AssignedUser)
            .Include(i => i.CreatedByUser)
            .Include(i => i.Comments).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Issue {request.Id} not found.");

        return new IssueDetailDto(
            issue.Id, issue.Title, issue.Description, issue.Status, issue.Priority,
            issue.HotelId, issue.Hotel.Name, issue.AssignedUserId, issue.AssignedUser?.Name,
            issue.CreatedAt, issue.CreatedByUserId, issue.CreatedByUser?.Name,
            issue.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto(c.Id, c.Content, c.User.Name, c.CreatedAt))
                .ToList());
    }
}
