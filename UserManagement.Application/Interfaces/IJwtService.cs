namespace UserManagement.Application.Interfaces;

public interface IJwtService
{
    (string Token, DateTime ExpiresAt) GenerateToken(
        int userId,
        string firstName,
        string lastName,
        string email,
        List<string> roles
    );
}