using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IFindingRepository
{
    // Belirli bir asset'in en son scan'ine ait findingleri getirir.
    Task<List<Finding>> GetByAssetIdAsync(int assetId);

    // Sistemdeki tüm scan'lerden gelen findingleri getirir.
    Task<List<Finding>> GetAllAsync();

    // Yeni finding kayıtlarını ekler.
    Task AddRangeAsync(List<Finding> findings);

    // Yapılan değişiklikleri veritabanına kaydeder.
    Task SaveChangesAsync();
}