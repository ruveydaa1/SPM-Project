
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
                "Zamanlanmış tarama kaydı bulunamadı: {ScheduledScanId}",
                scheduledScanId);

            return;
        }

        var asset = await _assetRepository.GetByIdAsync(assetId);

        if (asset == null)
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = "Asset bulunamadı.";
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return;
        }

        if (!asset.IsActive || string.IsNullOrWhiteSpace(asset.Url))
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = "Asset pasif veya repository URL boş.";
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return;
        }

        if (string.IsNullOrWhiteSpace(scanner) ||
            (!scanner.Equals("Semgrep", StringComparison.OrdinalIgnoreCase) &&
            !scanner.Equals("Trivy", StringComparison.OrdinalIgnoreCase)))
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = "Desteklenmeyen tarayıcı. Semgrep veya Trivy kullanılmalıdır.";
            scheduledScan.CompletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            throw new InvalidOperationException(
                "Desteklenmeyen tarayıcı. Semgrep veya Trivy kullanılmalıdır.");
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
                "Zamanlanmış tarama Kafka'ya gönderildi. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
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
                "Zamanlanmış tarama Kafka'ya gönderilemedi. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
                asset.Id,
                scanRun.Id);

            throw;
        }
    }
}
