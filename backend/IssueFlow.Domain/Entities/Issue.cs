using IssueFlow.Domain.Common;
using IssueFlow.Domain.Enums;

namespace IssueFlow.Domain.Entities;

public class Issue : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;
    public IssueStatus Status { get; set; } = IssueStatus.New;
    public Priority Priority { get; set; } = Priority.Medium;
    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }

    public User? CreatedByUser { get; set; }

    public Guid? CreatedByUserId { get; set; }
    public ICollection<IssueComment> Comments { get; set; } = new List<IssueComment>();
    public ICollection<IssueAttachment> Attachments { get; set; } = new List<IssueAttachment>();
    public ICollection<IssueHistory> History { get; set; } = new List<IssueHistory>();
}
