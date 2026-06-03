using IssueFlow.Domain.Common;

namespace IssueFlow.Domain.Entities;

public class IssueHistory : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid ChangedByUserId { get; set; }
    public User ChangedByUser { get; set; } = null!;
    public string FieldName { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}
