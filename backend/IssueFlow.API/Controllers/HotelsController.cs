using IssueFlow.Application.Features.Hotels.Commands.CreateHotel;
using IssueFlow.Application.Features.Hotels.Queries.GetHotels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IssueFlow.API.Controllers;

[ApiController]
[Route("api/hotels")]
[Authorize]
public class HotelsController : ControllerBase
{
    private readonly IMediator _mediator;

    public HotelsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetHotelsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHotelCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"api/hotels/{id}", new { id });
    }
}
