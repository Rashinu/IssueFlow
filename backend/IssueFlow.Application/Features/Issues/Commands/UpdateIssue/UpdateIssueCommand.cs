using IssueFlow.Domain.Enums;
using MediatR;

namespace IssueFlow.Application.Features.Issues.Commands.UpdateIssue;

public record UpdateIssueCommand(
    Guid Id,
    string Title,
    string Description,
    IssueStatus Status,
    Priority Priority,
    Guid? AssignedUserId) : IRequest;
