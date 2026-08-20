using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using UserManagement.Application.Interfaces;

namespace UserManagement.Infrastructure.Services;

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
            Subject = "Hesabınız Başarıyla Oluşturuldu",
            Body = $"""
                   Merhaba {firstName} {lastName},

                   Hesabınız başarıyla oluşturuldu.

                   Artık uygulamaya giriş yaparak hesabınızı kullanabilirsiniz.

                   İyi kullanımlar!
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
            Subject = "Şifre Sıfırlama",
            Body = $"""
               Merhaba {firstName},

               Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:

               {resetLink}

               Bu bağlantı belirli bir süre geçerlidir.

               Eğer bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayabilirsiniz.
               """,
            IsBodyHtml = false
        };

        mail.To.Add(email);

        await smtpClient.SendMailAsync(mail);
    }
}