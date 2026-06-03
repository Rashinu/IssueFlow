using IssueFlow.Application.Common.Interfaces;
using IssueFlow.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Application.Features.Issues.Commands.UpdateIssue;

public class UpdateIssueCommandHandler : IRequestHandler<UpdateIssueCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateIssueCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateIssueCommand request, CancellationToken cancellationToken)
    {
        var issue = await _db.Issues.FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Issue {request.Id} not found.");

        var userId = _currentUser.UserId;

        TrackChange(issue.Id, userId, "Status",   issue.Status.ToString(),   request.Status.ToString());
        TrackChange(issue.Id, userId, "Priority", issue.Priority.ToString(), request.Priority.ToString());
        TrackChange(issue.Id, userId, "Title",    issue.Title,               request.Title);

        issue.Title          = request.Title;
        issue.Description    = request.Description;
        issue.Status         = request.Status;
        issue.Priority       = request.Priority;
        issue.AssignedUserId = request.AssignedUserId;
        issue.UpdatedAt      = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
    }

    private void TrackChange(Guid issueId, Guid? userId, string field, string oldVal, string newVal)
    {
        if (oldVal == newVal || userId is null) return;

        _db.IssueHistory.Add(new IssueHistory
        {
            IssueId         = issueId,
            ChangedByUserId = userId.Value,
            FieldName       = field,
            OldValue        = oldVal,
            NewValue        = newVal,
        });
    }
}
