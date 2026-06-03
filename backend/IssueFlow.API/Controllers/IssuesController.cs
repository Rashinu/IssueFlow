using IssueFlow.Application.Features.Issues.Commands.AddComment;
using IssueFlow.Application.Features.Issues.Commands.CreateIssue;
using IssueFlow.Application.Features.Issues.Commands.DeleteIssue;
using IssueFlow.Application.Features.Issues.Commands.UpdateIssue;
using IssueFlow.Application.Features.Issues.Queries.GetIssueById;
using IssueFlow.Application.Features.Issues.Queries.GetIssues;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IssueFlow.API.Controllers;

[ApiController]
[Route("api/issues")]
[Authorize]
public class IssuesController : ControllerBase
{
    private readonly IMediator _mediator;

    public IssuesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? hotelId)
    {
        var result = await _mediator.Send(new GetIssuesQuery(hotelId));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetIssueByIdQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIssueCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateIssueCommand command)
    {
        await _mediator.Send(command with { Id = id });
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteIssueCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var commentId = await _mediator.Send(new AddCommentCommand(id, userId, request.Content));
        return Ok(new { id = commentId });
    }
}

public record AddCommentRequest(string Content);
