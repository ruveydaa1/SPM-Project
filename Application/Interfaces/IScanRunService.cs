using Application.DTOs.Scan;

namespace Application.Interfaces;

public interface IScanRunService
{
    Task<ScanRunResponse?> GetByIdAsync(int id);

    Task<List<ScanRunResponse>> GetByAssetIdAsync(int assetId);
}