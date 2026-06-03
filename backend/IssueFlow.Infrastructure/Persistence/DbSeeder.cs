using IssueFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IssueFlow.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Roles.AnyAsync())
            return; // zaten seed edilmiş

        var roles = new List<Role>
        {
            new() { Name = "Admin" },
            new() { Name = "Support" },
            new() { Name = "Developer" },
            new() { Name = "Manager" },
            new() { Name = "ReadOnly" },
        };

        context.Roles.AddRange(roles);
        await context.SaveChangesAsync();
    }
}
