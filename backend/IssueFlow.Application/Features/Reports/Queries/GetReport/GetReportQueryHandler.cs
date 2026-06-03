using IssueFlow.Application.Common.Interfaces;
using IssueFlow.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Application.Features.Reports.Queries.GetReport;

public class GetReportQueryHandler : IRequestHandler<GetReportQuery, ReportDto>
{
    private readonly IApplicationDbContext _db;

    public GetReportQueryHandler(IApplicationDbContext db) { _db = db; }

    public async Task<ReportDto> Handle(GetReportQuery request, CancellationToken cancellationToken)
    {
        var from = request.Period switch
        {
            ReportPeriod.Daily => DateTime.UtcNow.Date,
            ReportPeriod.Weekly => DateTime.UtcNow.Date.AddDays(-7),
            ReportPeriod.Monthly => DateTime.UtcNow.Date.AddMonths(-1),
            _ => throw new ArgumentOutOfRangeException(nameof(request.Period))
        };

        var issues = await _db.Issues
            .Include(i => i.Hotel)
            .Where(i => i.CreatedAt >= from)
            .ToListAsync(cancellationToken);

        return new ReportDto(
            Period: request.Period.ToString(),
            TotalIssues: issues.Count,
            NewIssues: issues.Count(i => i.Status == IssueStatus.New),
            ResolvedIssues: issues.Count(i => i.Status == IssueStatus.Resolved || i.Status == IssueStatus.Closed),
            CriticalIssues: issues.Count(i => i.Priority == Priority.Critical),
            ByHotel: issues.GroupBy(i => i.Hotel.Name)
                .Select(g => new HotelStat(g.Key, g.Count()))
                .OrderByDescending(s => s.Count).ToList(),
            ByStatus: issues.GroupBy(i => i.Status.ToString())
                .Select(g => new StatusStat(g.Key, g.Count())).ToList());
    }
}
