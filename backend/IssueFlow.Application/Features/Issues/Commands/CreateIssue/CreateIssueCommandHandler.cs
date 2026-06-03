using IssueFlow.Application.Common.Interfaces;
using IssueFlow.Domain.Entities;
using MediatR;

namespace IssueFlow.Application.Features.Issues.Commands.CreateIssue;

public class CreateIssueCommandHandler : IRequestHandler<CreateIssueCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateIssueCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateIssueCommand request, CancellationToken cancellationToken)
    {
        var issue = new Issue
        {
            Title = request.Title,
            Description = request.Description,
            HotelId = request.HotelId,
            Priority = request.Priority,
            AssignedUserId = request.AssignedUserId,
            CreatedByUserId = _currentUser.UserId,
        };
        _db.Issues.Add(issue);
        await _db.SaveChangesAsync(cancellationToken);
        return issue.Id;
    }
}
