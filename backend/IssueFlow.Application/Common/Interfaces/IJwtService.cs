using IssueFlow.Domain.Entities;

namespace IssueFlow.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
