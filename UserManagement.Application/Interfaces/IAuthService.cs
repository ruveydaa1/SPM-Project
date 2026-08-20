namespace UserManagement.Application.Interfaces;

using UserManagement.Application.DTOs;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);

    Task ForgotPasswordAsync(ForgotPasswordRequest request);

    Task ResetPasswordAsync(ResetPasswordRequest request);
}