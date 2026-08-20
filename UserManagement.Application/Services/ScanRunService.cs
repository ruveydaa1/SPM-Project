using UserManagement.Application.DTOs.Scan;
using UserManagement.Application.Interfaces;

namespace UserManagement.Application.Services;

public class ScanRunService : IScanRunService
{
    private readonly IScanRunRepository _scanRunRepository;

    public ScanRunService(IScanRunRepository scanRunRepository)
    {
        _scanRunRepository = scanRunRepository;
    }

    public async Task<ScanRunResponse?> GetByIdAsync(int id)
    {
        var scanRun = await _scanRunRepository.GetByIdAsync(id);

        if (scanRun == null)
        {
            return null;
        }

        return new ScanRunResponse
        {
            Id = scanRun.Id,
            AssetId = scanRun.AssetId,
            Scanner = scanRun.Scanner,
            Source = scanRun.Source,
            Status = scanRun.Status,
            StartedAt = scanRun.StartedAt,
            CompletedAt = scanRun.CompletedAt,
            Error = scanRun.Error ?? string.Empty,
            Findings = scanRun.Findings?
                .Select(f => new ScanFindingResponse
                {
                    Id = f.Id,
                    AssetId = f.AssetId,
                    ScanRunId = f.ScanRunId,
                    CheckId = f.CheckId,
                    Path = f.Path,
                    StartLine = f.StartLine,
                    StartColumn = f.StartColumn,
                    EndLine = f.EndLine,
                    EndColumn = f.EndColumn,
                    Message = f.Message,
                    Category = f.Category,
                    Severity = f.Severity,
                    Confidence = f.Confidence,
                    Impact = f.Impact,
                    Cwe = f.Cwe,
                    Owasp = f.Owasp,
                    VulnerabilityClass = f.VulnerabilityClass,
                    Reference = f.Reference,
                    CreatedAt = f.CreatedAt
                })
                .ToList() ?? new List<ScanFindingResponse>()
        };
    }

    public async Task<List<ScanRunResponse>> GetByAssetIdAsync(int assetId)
    {
        var scanRuns = await _scanRunRepository.GetByAssetIdAsync(assetId);

        return scanRuns.Select(scanRun => new ScanRunResponse
        {
            Id = scanRun.Id,
            AssetId = scanRun.AssetId,
            Scanner = scanRun.Scanner,
            Source = scanRun.Source,
            Status = scanRun.Status,
            StartedAt = scanRun.StartedAt,
            CompletedAt = scanRun.CompletedAt,
            Error = scanRun.Error ?? string.Empty,
            Findings = scanRun.Findings?
                .Select(f => new ScanFindingResponse
                {
                    Id = f.Id,
                    AssetId = f.AssetId,
                    ScanRunId = f.ScanRunId,
                    CheckId = f.CheckId,
                    Path = f.Path,
                    StartLine = f.StartLine,
                    StartColumn = f.StartColumn,
                    EndLine = f.EndLine,
                    EndColumn = f.EndColumn,
                    Message = f.Message,
                    Category = f.Category,
                    Severity = f.Severity,
                    Confidence = f.Confidence,
                    Impact = f.Impact,
                    Cwe = f.Cwe,
                    Owasp = f.Owasp,
                    VulnerabilityClass = f.VulnerabilityClass,
                    Reference = f.Reference,
                    CreatedAt = f.CreatedAt
                })
                .ToList() ?? new List<ScanFindingResponse>()
        }).ToList();
    }
}