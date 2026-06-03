using IssueFlow.Application.Common.Interfaces;
using IssueFlow.Domain.Entities;
using MediatR;

namespace IssueFlow.Application.Features.Issues.Commands.AddComment;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Guid>
{
    private readonly IApplicationDbContext _db;

    public AddCommentCommandHandler(IApplicationDbContext db) { _db = db; }

    public async Task<Guid> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = new IssueComment
        {
            IssueId = request.IssueId,
            UserId = request.UserId,
            Content = request.Content,
        };
        _db.IssueComments.Add(comment);
        await _db.SaveChangesAsync(cancellationToken);
        return comment.Id;
    }
}
