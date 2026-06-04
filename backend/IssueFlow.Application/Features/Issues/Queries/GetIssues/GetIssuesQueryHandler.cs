using IssueFlow.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Application.Features.Issues.Queries.GetIssues;

public class GetIssuesQueryHandler : IRequestHandler<GetIssuesQuery, List<IssueDto>>
{
    private readonly IApplicationDbContext _db;

    public GetIssuesQueryHandler(IApplicationDbContext db) { _db = db; }

    public async Task<List<IssueDto>> Handle(GetIssuesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Issues
            .Include(i => i.Hotel)
            .Include(i => i.AssignedUser)
            .Include(i => i.CreatedByUser)
            .AsQueryable();

        if (request.HotelId.HasValue)
            query = query.Where(i => i.HotelId == request.HotelId.Value);

        return await query
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new IssueDto(
                i.Id, i.Title, i.Description, i.Status, i.Priority,
                i.Hotel.Name,
                i.AssignedUser != null ? i.AssignedUser.Name : null,
                i.CreatedByUser != null ? i.CreatedByUser.Name : null,
                i.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
