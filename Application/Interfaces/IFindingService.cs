using Domain.Entities;

namespace Application.Interfaces;

public interface IFindingService
{
    // Belirli bir asset'in en son scan'ine ait finding'leri getirir.
    Task<List<Finding>> GetByAssetIdAsync(int assetId);

    // Sistemdeki tÃ¼m finding'leri getirir.
    Task<List<Finding>> GetAllAsync();

    Task<Finding?> GetByIdAsync(int id);
}