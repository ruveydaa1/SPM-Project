using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task<List<User>> GetAllAsync();

    Task<User?> GetByIdAsync(int id);

    Task<bool> EmailExistsAsync(string email);

    Task<Role?> GetRoleByNameAsync(string roleName);

    Task AddAsync(User user);

    Task AddUserRoleAsync(UserRole userRole);

    Task UpdateAsync(User user);

    void RemoveUserRole(UserRole userRole);

    void RemoveUserRoles(IEnumerable<UserRole> userRoles);

    Task<User?> GetByPasswordResetTokenAsync(string token);

    Task DeleteAsync(User user);
    
    Task SaveChangesAsync();

}