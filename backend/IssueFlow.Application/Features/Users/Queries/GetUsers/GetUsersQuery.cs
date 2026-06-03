using MediatR;

namespace IssueFlow.Application.Features.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<List<UserDto>>;

public record UserDto(Guid Id, string Name, string Email, string Role);
