using IssueFlow.Application.Common.Interfaces;
using IssueFlow.Domain.Entities;
using MediatR;

namespace IssueFlow.Application.Features.Hotels.Commands.CreateHotel;

public class CreateHotelCommandHandler : IRequestHandler<CreateHotelCommand, Guid>
{
    private readonly IApplicationDbContext _db;

    public CreateHotelCommandHandler(IApplicationDbContext db) { _db = db; }

    public async Task<Guid> Handle(CreateHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = new Hotel { Name = request.Name, Address = request.Address };
        _db.Hotels.Add(hotel);
        await _db.SaveChangesAsync(cancellationToken);
        return hotel.Id;
    }
}
