using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateUserRequest
{
    [Required(ErrorMessage = "Ad alanÄ± zorunludur.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad alanÄ± zorunludur.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email alanÄ± zorunludur.")]
    [EmailAddress(ErrorMessage = "GeÃ§erli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Åifre alanÄ± zorunludur.")]
    [MinLength(4, ErrorMessage = "Åifre en az 4 karakter olmalÄ±dÄ±r.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Rol alanÄ± zorunludur.")]
    public string Role { get; set; } = "User";
}