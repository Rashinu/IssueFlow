using MediatR;

namespace IssueFlow.Application.Features.Issues.Commands.DeleteIssue;

public record DeleteIssueCommand(Guid Id) : IRequest;
