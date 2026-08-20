using UserManagement.Application.DTOs.Assets;

namespace UserManagement.Application.Interfaces;

public interface IAssetService
{
    Task<List<AssetResponse>> GetAssetsAsync();

    Task<AssetResponse?> GetAssetAsync(int id);

    Task<int> CreateAssetAsync(CreateAssetRequest request);

    Task UpdateAssetAsync(int id, UpdateAssetRequest request);

    Task DeleteAssetAsync(int id);
}