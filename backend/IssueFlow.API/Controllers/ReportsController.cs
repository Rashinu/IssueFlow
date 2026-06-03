using IssueFlow.Application.Features.Reports.Queries.GetReport;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IssueFlow.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("daily")]
    public async Task<IActionResult> GetDaily()
        => Ok(await _mediator.Send(new GetReportQuery(ReportPeriod.Daily)));

    [HttpGet("weekly")]
    public async Task<IActionResult> GetWeekly()
        => Ok(await _mediator.Send(new GetReportQuery(ReportPeriod.Weekly)));

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthly()
        => Ok(await _mediator.Send(new GetReportQuery(ReportPeriod.Monthly)));
}
