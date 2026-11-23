using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Token alanÄ± zorunludur.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni ÅŸifre alanÄ± zorunludur.")]
    [MinLength(4, ErrorMessage = "Åifre en az 4 karakter olmalÄ±dÄ±r.")]
    public string NewPassword { get; set; } = string.Empty;
}