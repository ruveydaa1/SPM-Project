using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "Email alanÄ± zorunludur.")]
    [EmailAddress(ErrorMessage = "GeÃ§erli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Åifre alanÄ± zorunludur.")]
    public string Password { get; set; } = string.Empty;
}