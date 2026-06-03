using MediatR;

namespace IssueFlow.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string Name, string Email, string Password, Guid RoleId) : IRequest<Guid>;
