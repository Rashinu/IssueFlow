using MediatR;

namespace IssueFlow.Application.Features.Issues.Commands.AddComment;

public record AddCommentCommand(Guid IssueId, Guid UserId, string Content) : IRequest<Guid>;
