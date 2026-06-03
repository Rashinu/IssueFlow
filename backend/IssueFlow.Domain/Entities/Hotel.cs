using IssueFlow.Domain.Common;

namespace IssueFlow.Domain.Entities;

public class Hotel : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public ICollection<Issue> Issues { get; set; } = new List<Issue>();
}
