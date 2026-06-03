using IssueFlow.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Application.Features.Issues.Commands.DeleteIssue;

public class DeleteIssueCommandHandler : IRequestHandler<DeleteIssueCommand>
{
    private readonly IApplicationDbContext _db;

    public DeleteIssueCommandHandler(IApplicationDbContext db) { _db = db; }

    public async Task Handle(DeleteIssueCommand request, CancellationToken cancellationToken)
    {
        var issue = await _db.Issues.FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Issue {request.Id} not found.");
        _db.Issues.Remove(issue);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
