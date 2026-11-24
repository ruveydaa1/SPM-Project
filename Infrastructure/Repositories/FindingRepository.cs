using Microsoft.EntityFrameworkCore;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

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

    // Sistemdeki tÃ¼m scan'lere ait tÃ¼m vulnerability finding'lerini getirir.
    public async Task<List<Finding>> GetAllAsync()
    {
        return await _context.Findings
            // Finding'in baÄŸlÄ± olduÄŸu Asset bilgisini de getirir.
            .Include(f => f.Asset)

            // Finding'in baÄŸlÄ± olduÄŸu ScanRun bilgisini de getirir.
            .Include(f => f.ScanRun)

            // En yeni finding'ler Ã¶nce gelecek ÅŸekilde sÄ±ralar.
            .OrderByDescending(f => f.CreatedAt)

            // Sorguyu Ã§alÄ±ÅŸtÄ±rÄ±r ve sonuÃ§larÄ± List<Finding> olarak dÃ¶ndÃ¼rÃ¼r.
            .ToListAsync();
    }

    public async Task<Finding?> GetByIdAsync(int id)
    {
        return await _context.Findings
            .Include(f => f.Asset)
            .Include(f => f.ScanRun)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}