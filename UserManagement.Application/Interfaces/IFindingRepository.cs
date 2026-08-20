using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IFindingRepository
{
    Task AddRangeAsync(List<Finding> findings);

    Task<List<Finding>> GetByAssetIdAsync(int assetId);

    Task SaveChangesAsync();
}