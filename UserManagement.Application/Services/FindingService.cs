using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Services;

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
}