using UserManagement.Application.DTOs.Assets;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Services;

public class AssetService : IAssetService
{
    private readonly IAssetRepository _assetRepository;

    public AssetService(IAssetRepository assetRepository)
    {
        _assetRepository = assetRepository;
    }

    public async Task<List<AssetResponse>> GetAssetsAsync()
    {
        var assets = await _assetRepository.GetAllAsync();

        return assets.Select(MapToResponse).ToList();
    }

    public async Task<AssetResponse?> GetAssetAsync(int id)
    {
        var asset = await _assetRepository.GetByIdAsync(id);

        if (asset == null)
        {
            return null;
        }

        return MapToResponse(asset);
    }

    public async Task<int> CreateAssetAsync(CreateAssetRequest request)
    {
        var asset = new Asset
        {
            Name = request.Name,
            Type = request.Type,
            Url = request.Url,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _assetRepository.AddAsync(asset);
        await _assetRepository.SaveChangesAsync();

        return asset.Id;
    }

    public async Task UpdateAssetAsync(
        int id,
        UpdateAssetRequest request)
    {
        var asset = await _assetRepository.GetByIdAsync(id);

        if (asset == null)
        {
            throw new InvalidOperationException(
                "Asset bulunamadı.");
        }

        asset.Name = request.Name;
        asset.Type = request.Type;
        asset.Url = request.Url;
        asset.Description = request.Description;
        asset.IsActive = request.IsActive;
        asset.UpdatedAt = DateTime.UtcNow;

        await _assetRepository.UpdateAsync(asset);
        await _assetRepository.SaveChangesAsync();
    }

    public async Task DeleteAssetAsync(int id)
    {
        var asset = await _assetRepository.GetByIdAsync(id);

        if (asset == null)
        {
            throw new InvalidOperationException(
                "Asset bulunamadı.");
        }

        await _assetRepository.DeleteAsync(asset);
        await _assetRepository.SaveChangesAsync();
    }

    private static AssetResponse MapToResponse(Asset asset)
    {
        return new AssetResponse
        {
            Id = asset.Id,
            Name = asset.Name,
            Type = asset.Type,
            Url = asset.Url,
            Description = asset.Description,
            IsActive = asset.IsActive,
            CreatedAt = asset.CreatedAt,
            UpdatedAt = asset.UpdatedAt
        };
    }
}