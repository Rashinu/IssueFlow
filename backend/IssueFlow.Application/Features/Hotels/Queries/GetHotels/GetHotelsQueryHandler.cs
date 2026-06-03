using IssueFlow.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Application.Features.Hotels.Queries.GetHotels;

public class GetHotelsQueryHandler : IRequestHandler<GetHotelsQuery, List<HotelDto>>
{
    private readonly IApplicationDbContext _db;

    public GetHotelsQueryHandler(IApplicationDbContext db) { _db = db; }

    public async Task<List<HotelDto>> Handle(GetHotelsQuery request, CancellationToken cancellationToken)
    {
        return await _db.Hotels
            .OrderBy(h => h.Name)
            .Select(h => new HotelDto(h.Id, h.Name, h.Address, h.Issues.Count))
            .ToListAsync(cancellationToken);
    }
}
