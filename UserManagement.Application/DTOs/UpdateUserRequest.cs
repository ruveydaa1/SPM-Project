using System.ComponentModel.DataAnnotations;

namespace UserManagement.Application.DTOs;

public class UpdateUserRequest
{
    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad alanı zorunludur.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    [Required(ErrorMessage = "Rol alanı zorunludur.")]
    public string Role { get; set; } = "User";
}