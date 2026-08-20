using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.DTOs;
using UserManagement.Application.Interfaces;

namespace UserManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // GET: api/users
    [Authorize(Roles = "SuperAdmin,Admin,Developer")]
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userService.GetUsersAsync();

        return Ok(users);
    }

    // GET: api/users/1
    [Authorize(Roles = "SuperAdmin,Admin,Developer")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userService.GetUserAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Kullanıcı bulunamadı."
            });
        }

        return Ok(user);
    }

    // POST: api/users
    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateUser(
        CreateUserRequest request)
    {
        try
        {
            var userId = await _userService.CreateUserAsync(request);

            return Ok(new
            {
                message = "Kullanıcı başarıyla oluşturuldu.",
                userId
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // PUT: api/users/1
    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        UpdateUserRequest request)
    {
        try
        {
            await _userService.UpdateUserAsync(id, request);

            return Ok(new
            {
                message = "Kullanıcı başarıyla güncellendi."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // DELETE: api/users/1
    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            await _userService.DeleteUserAsync(id);

            return Ok(new
            {
                message = "Kullanıcı başarıyla silindi."
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }
}