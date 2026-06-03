using MediatR;

namespace IssueFlow.Application.Features.Reports.Queries.GetReport;

public enum ReportPeriod { Daily, Weekly, Monthly }

public record GetReportQuery(ReportPeriod Period) : IRequest<ReportDto>;

public record ReportDto(
    string Period,
    int TotalIssues,
    int NewIssues,
    int ResolvedIssues,
    int CriticalIssues,
    List<HotelStat> ByHotel,
    List<StatusStat> ByStatus);

public record HotelStat(string HotelName, int Count);
public record StatusStat(string Status, int Count);
