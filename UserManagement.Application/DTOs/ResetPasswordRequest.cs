using System.ComponentModel.DataAnnotations;

namespace UserManagement.Application.DTOs;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Token alanı zorunludur.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre alanı zorunludur.")]
    [MinLength(4, ErrorMessage = "Şifre en az 4 karakter olmalıdır.")]
    public string NewPassword { get; set; } = string.Empty;
}