using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Repositories;

public class AssetRepository : IAssetRepository
{
    private readonly AppDbContext _context;

    public AssetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Asset>> GetAllAsync()
    {
        return await _context.Assets
            .ToListAsync();
    }

    public async Task<Asset?> GetByIdAsync(int id)
    {
        return await _context.Assets
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task AddAsync(Asset asset)
    {
        await _context.Assets.AddAsync(asset);
    }

    public async Task UpdateAsync(Asset asset)
    {
        _context.Assets.Update(asset);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Asset asset)
    {
        _context.Assets.Remove(asset);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}