using UserManagement.Application.DTOs;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    private readonly IEmailService _emailService;

    public UserService(
    IUserRepository userRepository,
    IEmailService emailService)
    {
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<List<UserResponse>> GetUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(u => new UserResponse
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
            Roles = u.UserRoles
                .Select(ur => ur.Role.Name)
                .ToList()
        }).ToList();
    }

    public async Task<UserResponse?> GetUserAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            return null;
        }

        return new UserResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Roles = user.UserRoles
                .Select(ur => ur.Role.Name)
                .ToList()
        };
    }

    public async Task<int> CreateUserAsync(CreateUserRequest request)
    {
        var emailExists = await _userRepository.EmailExistsAsync(request.Email);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "Bu email adresi zaten kullanılıyor."
            );
        }

        if (request.Role.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "SuperAdmin rolü yeni kullanıcıya atanamaz."
            );
        }

        var role = await _userRepository.GetRoleByNameAsync(request.Role);

        if (role == null)
        {
            throw new InvalidOperationException(
                "Belirtilen rol bulunamadı."
            );
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        await _userRepository.SaveChangesAsync();

        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = role.Id
        };

        await _userRepository.AddUserRoleAsync(userRole);

        await _userRepository.SaveChangesAsync();

        await _emailService.SendWelcomeEmailAsync(
            user.Email,
            user.FirstName,
            user.LastName
        );


        return user.Id;
    }

    public async Task UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            throw new InvalidOperationException(
                "Kullanıcı bulunamadı."
            );
        }

        var emailExists = await _userRepository.EmailExistsAsync(request.Email);

        if (emailExists && user.Email != request.Email)
        {
            throw new InvalidOperationException(
                "Bu email adresi zaten kullanılıyor."
            );
        }

        var role = await _userRepository.GetRoleByNameAsync(request.Role);

        if (role == null)
        {
            throw new InvalidOperationException(
                "Belirtilen rol bulunamadı."
            );
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.IsActive = request.IsActive;

        user.CreatedAt = DateTime.SpecifyKind(
            user.CreatedAt,
            DateTimeKind.Utc
        );

        user.UpdatedAt = DateTime.UtcNow;

        // Kullanıcı bilgilerini güncelle
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        // Mevcut rol ilişkilerini kaldır
        var existingRoles = user.UserRoles.ToList();

        if (existingRoles.Any())
        {
            _userRepository.RemoveUserRoles(existingRoles);
            await _userRepository.SaveChangesAsync();
        }

        // Yeni rol ilişkisini oluştur
        var newUserRole = new UserRole
        {
            UserId = user.Id,
            RoleId = role.Id
        };

        await _userRepository.AddUserRoleAsync(newUserRole);
        await _userRepository.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            throw new InvalidOperationException(
                "Kullanıcı bulunamadı."
            );
        }

        await _userRepository.DeleteAsync(user);
        await _userRepository.SaveChangesAsync();
    }
}