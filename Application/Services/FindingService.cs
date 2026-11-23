using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class FindingService : IFindingService
{
    private readonly IFindingRepository _findingRepository;

    public FindingService(IFindingRepository findingRepository)
    {
        _findingRepository = findingRepository;
    }

    public async Task<List<Finding>> GetByAssetIdAsync(int assetId)
    {
        return await _findingRepository.GetByAssetIdAsync(assetId);
    }

    // Sistemdeki tÃ¼m finding'leri repository Ã¼zerinden getirir.
    public async Task<List<Finding>> GetAllAsync()
    {
        return await _findingRepository.GetAllAsync();
    }

    public async Task<Finding?> GetByIdAsync(int id)
    {
        return await _findingRepository.GetByIdAsync(id);
    }
}