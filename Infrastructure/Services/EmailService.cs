using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Application.Interfaces;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendWelcomeEmailAsync(
        string email,
        string firstName,
        string lastName)
    {
        var smtpHost = _configuration["Smtp:Host"]!;
        var smtpPort = int.Parse(_configuration["Smtp:Port"]!);
        var smtpUsername = _configuration["Smtp:Username"]!;
        var smtpPassword = _configuration["Smtp:Password"]!;
        var fromEmail = _configuration["Smtp:FromEmail"]!;
        var fromName = _configuration["Smtp:FromName"]!;

        using var smtpClient = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(
                smtpUsername,
                smtpPassword
            )
        };

        var mail = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = "Your Account Has Been Created Successfully",
            Body = $"""
                   Hello {firstName} {lastName},

                   Your account has been created successfully.

                   You can now log in to the application and start using your account.

                   Enjoy using the application!
                   """,
            IsBodyHtml = false
        };

        mail.To.Add(email);

        await smtpClient.SendMailAsync(mail);
    }

    public async Task SendPasswordResetEmailAsync(
    string email,
    string firstName,
    string resetLink)
    {
        var smtpHost = _configuration["Smtp:Host"]!;
        var smtpPort = int.Parse(_configuration["Smtp:Port"]!);
        var smtpUsername = _configuration["Smtp:Username"]!;
        var smtpPassword = _configuration["Smtp:Password"]!;
        var fromEmail = _configuration["Smtp:FromEmail"]!;
        var fromName = _configuration["Smtp:FromName"]!;

        using var smtpClient = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(
                smtpUsername,
                smtpPassword
            )
        };

        var mail = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = "Password Reset",
            Body = $"""
                    Hello {firstName},

                    Click the link below to reset your password:

                    {resetLink}

                    This link is valid for a limited time.

                    If you did not request this, you can safely ignore this email.
                    """,
            IsBodyHtml = false
        };

        mail.To.Add(email);

        await smtpClient.SendMailAsync(mail);
    }
}