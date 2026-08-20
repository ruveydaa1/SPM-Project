using System.ComponentModel.DataAnnotations;

namespace UserManagement.Application.DTOs;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Email alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;
}