using UserManagement.Application.DTOs.Scan;

namespace UserManagement.Application.Interfaces;

public interface IScanRunService
{
    Task<ScanRunResponse?> GetByIdAsync(int id);

    Task<List<ScanRunResponse>> GetByAssetIdAsync(int assetId);
}