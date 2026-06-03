using IssueFlow.Domain.Common;

namespace IssueFlow.Domain.Entities;

public class IssueComment : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
}
