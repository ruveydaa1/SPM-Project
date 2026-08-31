using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IFindingService
{
    // Belirli bir asset'in en son scan'ine ait finding'leri getirir.
    Task<List<Finding>> GetByAssetIdAsync(int assetId);

    // Sistemdeki tüm finding'leri getirir.
    Task<List<Finding>> GetAllAsync();
}