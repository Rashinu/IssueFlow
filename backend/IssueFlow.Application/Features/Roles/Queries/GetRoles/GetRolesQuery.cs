using MediatR;

namespace IssueFlow.Application.Features.Roles.Queries.GetRoles;

public record GetRolesQuery : IRequest<List<RoleDto>>;

public record RoleDto(Guid Id, string Name);
