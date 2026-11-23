using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Email alanÄ± zorunludur.")]
    [EmailAddress(ErrorMessage = "GeÃ§erli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;
}