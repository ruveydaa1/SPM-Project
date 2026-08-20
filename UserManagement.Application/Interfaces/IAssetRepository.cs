using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IAssetRepository
{
    Task<List<Asset>> GetAllAsync();

    Task<Asset?> GetByIdAsync(int id);

    Task AddAsync(Asset asset);

    Task UpdateAsync(Asset asset);

    Task DeleteAsync(Asset asset);

    Task SaveChangesAsync();
}