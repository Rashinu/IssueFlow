using IssueFlow.Domain.Common;

namespace IssueFlow.Domain.Entities;

public class IssueAttachment : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
}
