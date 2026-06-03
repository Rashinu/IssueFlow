using MediatR;

namespace IssueFlow.Application.Features.Hotels.Queries.GetHotels;

public record GetHotelsQuery : IRequest<List<HotelDto>>;

public record HotelDto(Guid Id, string Name, string Address, int IssueCount);
