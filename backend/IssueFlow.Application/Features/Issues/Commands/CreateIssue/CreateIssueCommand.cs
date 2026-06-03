using IssueFlow.Domain.Enums;
using MediatR;

namespace IssueFlow.Application.Features.Issues.Commands.CreateIssue;

public record CreateIssueCommand(
    string Title,
    string Description,
    Guid HotelId,
    Priority Priority,
    Guid? AssignedUserId) : IRequest<Guid>;
