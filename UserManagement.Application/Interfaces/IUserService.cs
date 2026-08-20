using UserManagement.Application.DTOs;

namespace UserManagement.Application.Interfaces;

public interface IUserService
{
    Task<List<UserResponse>> GetUsersAsync();

    Task<UserResponse?> GetUserAsync(int id);

    Task<int> CreateUserAsync(CreateUserRequest request);

    Task UpdateUserAsync(int id, UpdateUserRequest request);

    Task DeleteUserAsync(int id);
}