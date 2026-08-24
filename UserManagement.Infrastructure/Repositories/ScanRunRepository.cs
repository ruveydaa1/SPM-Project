using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Repositories;

public class ScanRunRepository : IScanRunRepository
{
    private readonly AppDbContext _context;

    public ScanRunRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ScanRun?> GetByIdAsync(int id)
    {
        return await _context.ScanRuns
            .Include(s => s.Findings)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<ScanRun>> GetByAssetIdAsync(int assetId)
    {
        return await _context.ScanRuns
            .Include(s => s.Findings)
            .Where(s => s.AssetId == assetId)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();
    }

    public async Task<List<ScanRun>> GetAllAsync()
    {
        return await _context.ScanRuns
            .Include(s => s.Findings)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();
    }

    public async Task AddAsync(ScanRun scanRun)
    {
        await _context.ScanRuns.AddAsync(scanRun);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}