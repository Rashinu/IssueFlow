using IssueFlow.Domain.Enums;
using MediatR;

namespace IssueFlow.Application.Features.Issues.Queries.GetIssues;

public record GetIssuesQuery(Guid? HotelId) : IRequest<List<IssueDto>>;

public record IssueDto(
    Guid Id,
    string Title,
    string Description,
    IssueStatus Status,
    Priority Priority,
    string HotelName,
    string? AssignedUserName,
    string? CreatedByUserName,
    DateTime CreatedAt);
