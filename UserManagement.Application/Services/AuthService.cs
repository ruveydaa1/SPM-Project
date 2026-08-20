using System.Security.Cryptography;
using UserManagement.Application.DTOs;
using UserManagement.Application.Interfaces;

namespace UserManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;

    public AuthService(
        IUserRepository userRepository,
        IJwtService jwtService,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Kullanıcı hesabı aktif değil.");
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");
        }

        var roles = user.UserRoles
            .Select(ur => ur.Role.Name)
            .ToList();

        var (token, expiration) = _jwtService.GenerateToken(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            roles
        );

        return new LoginResponse
        {
            Token = token,
            ExpiresAt = expiration,
            UserId = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Roles = roles
        };
    }

    public async Task ForgotPasswordAsync(
        ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        // Kullanıcı bulunamasa bile aynı şekilde devam ediyoruz.
        // Böylece sistemde hangi email adreslerinin kayıtlı olduğu
        // dışarıdan anlaşılmaz.
        if (user == null || !user.IsActive)
        {
            return;
        }

        var tokenBytes = RandomNumberGenerator.GetBytes(32);

        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        user.PasswordResetToken = token;

        user.PasswordResetTokenExpiresAt =
            DateTime.SpecifyKind(
                DateTime.UtcNow.AddMinutes(30),
                DateTimeKind.Utc
            );

        user.CreatedAt = DateTime.SpecifyKind(
            user.CreatedAt,
            DateTimeKind.Utc
        );

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var resetLink =
            $"http://localhost:3000/reset-password?token={token}";

        await _emailService.SendPasswordResetEmailAsync(
            user.Email,
            user.FirstName,
            resetLink
        );
    }

    public async Task ResetPasswordAsync(
        ResetPasswordRequest request)
    {
        var user = await _userRepository.GetByPasswordResetTokenAsync(
            request.Token
        );

        if (user == null)
        {
            throw new UnauthorizedAccessException(
                "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı."
            );
        }

        if (user.PasswordResetToken != request.Token)
        {
            throw new UnauthorizedAccessException(
                "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı."
            );
        }

        if (
            user.PasswordResetTokenExpiresAt == null ||
            user.PasswordResetTokenExpiresAt < DateTime.UtcNow
        )
        {
            throw new UnauthorizedAccessException(
                "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı."
            );
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;

        // PostgreSQL timestamp with time zone için
        // veritabanından gelen CreatedAt değerini UTC olarak işaretliyoruz.
        user.CreatedAt = DateTime.SpecifyKind(
            user.CreatedAt,
            DateTimeKind.Utc
        );

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();
    }
}