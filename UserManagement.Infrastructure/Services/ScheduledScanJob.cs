
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public class ScheduledScanJob
{
    private readonly IAssetRepository _assetRepository;
    private readonly IScanRunRepository _scanRunRepository;
    private readonly KafkaScanProducer _kafkaScanProducer;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<ScheduledScanJob> _logger;

    public ScheduledScanJob(
        IAssetRepository assetRepository,
        IScanRunRepository scanRunRepository,
        KafkaScanProducer kafkaScanProducer,
        AppDbContext dbContext,
        ILogger<ScheduledScanJob> logger)
    {
        _assetRepository = assetRepository;
        _scanRunRepository = scanRunRepository;
        _kafkaScanProducer = kafkaScanProducer;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ExecuteAsync(
        int assetId,
        int? startedByUserId,
        string scanner,
        int scheduledScanId)
    {
        var scheduledScan = await _dbContext.ScheduledScans
            .FirstOrDefaultAsync(s => s.Id == scheduledScanId);

        if (scheduledScan == null)
        {
            _logger.LogWarning(
                "Scheduled scan record not found: {ScheduledScanId}",
                scheduledScanId);

            return;
        }

        var asset = await _assetRepository.GetByIdAsync(assetId);

        if (asset == null)
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = "Asset not found.";
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return;
        }

        if (!asset.IsActive || string.IsNullOrWhiteSpace(asset.Url))
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = "Asset is inactive or repository URL is empty.";
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return;
        }

        if (string.IsNullOrWhiteSpace(scanner) ||
            (!scanner.Equals("Semgrep", StringComparison.OrdinalIgnoreCase) &&
            !scanner.Equals("Trivy", StringComparison.OrdinalIgnoreCase )   &&
            !scanner.Equals("Gitleaks", StringComparison.OrdinalIgnoreCase )   &&
            !scanner.Equals("SonarQube", StringComparison.OrdinalIgnoreCase)))
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = "Unsupported scanner. Please select a valid scanner.";
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            throw new InvalidOperationException(
                "Unsupported scanner. Please select a valid scanner.");
        }

        scheduledScan.Status = "Running";
        scheduledScan.StartedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        var scanRun = new ScanRun
        {
            AssetId = asset.Id,
            StartedByUserId = startedByUserId,
            Scanner = scanner,
            Source = asset.Url,
            Status = "Started",
            StartedAt = DateTime.UtcNow
        };

        await _scanRunRepository.AddAsync(scanRun);
        await _scanRunRepository.SaveChangesAsync();

        scheduledScan.ScanRunId = scanRun.Id;
        await _dbContext.SaveChangesAsync();

        try
        {
            await _kafkaScanProducer.SendScanRequestAsync(
                asset.Id,
                asset.Url,
                scanner,
                scanRun.Id);

            _logger.LogInformation(
                "Scheduled scan request sent to Kafka. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
                asset.Id,
                scanRun.Id);
        }
        catch (Exception ex)
        {
            scanRun.Status = "Failed";
            scanRun.CompletedAt = DateTime.UtcNow;
            scanRun.Error = ex.Message;
            await _scanRunRepository.SaveChangesAsync();

            scheduledScan.Status = "Failed";
            scheduledScan.Error = ex.Message;
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            _logger.LogError(
                ex,
                "Failed to send scheduled scan request to Kafka. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
                asset.Id,
                scanRun.Id);

            throw;
        }
    }
}