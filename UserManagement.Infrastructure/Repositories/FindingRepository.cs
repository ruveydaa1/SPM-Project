using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Repositories;

public class FindingRepository : IFindingRepository
{
    private readonly AppDbContext _context;

    public FindingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(List<Finding> findings)
    {
        await _context.Findings.AddRangeAsync(findings);
    }

    public async Task<List<Finding>> GetByAssetIdAsync(int assetId)
    {
        var latestScanRunId = await _context.ScanRuns
            .Where(s => s.AssetId == assetId)
            .OrderByDescending(s => s.StartedAt)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        if (latestScanRunId == null)
        {
            return new List<Finding>();
        }

        return await _context.Findings
            .Where(f =>
                f.AssetId == assetId &&
                f.ScanRunId == latestScanRunId.Value)
            .OrderBy(f => f.Id)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}