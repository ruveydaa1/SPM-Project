using UserManagement.Domain.Entities;

namespace UserManagement.Application.Interfaces;

public interface IFindingService
{
    Task<List<Finding>> GetByAssetIdAsync(int assetId);
}