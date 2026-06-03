using MediatR;

namespace IssueFlow.Application.Features.Hotels.Commands.CreateHotel;

public record CreateHotelCommand(string Name, string Address) : IRequest<Guid>;
