using IssueFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Hotel> Hotels { get; }
    DbSet<Issue> Issues { get; }
    DbSet<IssueComment> IssueComments { get; }
    DbSet<IssueAttachment> IssueAttachments { get; }
    DbSet<IssueHistory> IssueHistory { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
