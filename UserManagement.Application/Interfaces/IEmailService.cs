namespace UserManagement.Application.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(
        string email,
        string firstName,
        string lastName);

    Task SendPasswordResetEmailAsync(
        string email,
        string firstName,
        string resetLink);
            
}