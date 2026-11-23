using System.Security.Cryptography;
using Application.DTOs;
using Application.Interfaces;

namespace Application.Services;

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
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is inactive.");
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
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

        // KullanÄ±cÄ± bulunamasa bile aynÄ± ÅŸekilde devam ediyoruz.
        // BÃ¶ylece sistemde hangi email adreslerinin kayÄ±tlÄ± olduÄŸu
        // dÄ±ÅŸarÄ±dan anlaÅŸÄ±lmaz.
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
                "Invalid or expired password reset link."
            );
        }

        if (user.PasswordResetToken != request.Token)
        {
            throw new UnauthorizedAccessException(
                "Invalid or expired password reset link."
            );
        }

        if (
            user.PasswordResetTokenExpiresAt == null ||
            user.PasswordResetTokenExpiresAt < DateTime.UtcNow
        )
        {
            throw new UnauthorizedAccessException(
                "Invalid or expired password reset link."
            );
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;

        // PostgreSQL timestamp with time zone iÃ§in
        // veritabanÄ±ndan gelen CreatedAt deÄŸerini UTC olarak iÅŸaretliyoruz.
        user.CreatedAt = DateTime.SpecifyKind(
            user.CreatedAt,
            DateTimeKind.Utc
        );

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();
    }
}