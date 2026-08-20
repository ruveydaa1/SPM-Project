using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IScanRunRepository
{
    Task<ScanRun?> GetByIdAsync(int id);

    Task<List<ScanRun>> GetByAssetIdAsync(int assetId);

    Task AddAsync(ScanRun scanRun);

    Task SaveChangesAsync();
}