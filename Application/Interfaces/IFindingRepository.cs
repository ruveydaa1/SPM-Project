using Domain.Entities;

namespace Application.Interfaces;

public interface IFindingRepository
{
    // Belirli bir asset'in en son scan'ine ait findingleri getirir.
    Task<List<Finding>> GetByAssetIdAsync(int assetId);

    // Sistemdeki tÃ¼m scan'lerden gelen findingleri getirir.
    Task<List<Finding>> GetAllAsync();

    Task<Finding?> GetByIdAsync(int id);

    // Yeni finding kayÄ±tlarÄ±nÄ± ekler.
    Task AddRangeAsync(List<Finding> findings);

    // YapÄ±lan deÄŸiÅŸiklikleri veritabanÄ±na kaydeder.
    Task SaveChangesAsync();
}