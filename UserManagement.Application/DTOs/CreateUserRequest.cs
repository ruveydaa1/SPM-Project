using System.ComponentModel.DataAnnotations;

namespace UserManagement.Application.DTOs;

public class CreateUserRequest
{
    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad alanı zorunludur.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre alanı zorunludur.")]
    [MinLength(4, ErrorMessage = "Şifre en az 4 karakter olmalıdır.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Rol alanı zorunludur.")]
    public string Role { get; set; } = "User";
}