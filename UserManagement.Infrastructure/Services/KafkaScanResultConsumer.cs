using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UserManagement.Application.DTOs.Scan;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;

namespace UserManagement.Infrastructure.Services;

public class KafkaScanResultConsumer : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<KafkaScanResultConsumer> _logger;

    public KafkaScanResultConsumer(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<KafkaScanResultConsumer> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        var bootstrapServers =
            _configuration["Kafka:BootstrapServers"]
            ?? "localhost:9092";

        var topic =
            _configuration["Kafka:ResultTopic"]
            ?? "asset-scan-result";

        var groupId =
            _configuration["Kafka:ResultConsumerGroup"]
            ?? "asset-scan-result-workers";

        var config = new ConsumerConfig
        {
            BootstrapServers = bootstrapServers,
            GroupId = groupId,
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        using var consumer =
            new ConsumerBuilder<Ignore, string>(config)
                .Build();

        consumer.Subscribe(topic);

        _logger.LogInformation(
            "Kafka scan result consumer başlatıldı. Topic: {Topic}",
            topic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var result =
                        consumer.Consume(stoppingToken);

                    if (string.IsNullOrWhiteSpace(
                            result.Message.Value))
                    {
                        continue;
                    }

                    var scanResult =
                        JsonSerializer.Deserialize<ScanResult>(
                            result.Message.Value);

                    if (scanResult == null)
                    {
                        _logger.LogWarning(
                            "Kafka scan result mesajı çözümlenemedi.");

                        continue;
                    }

                    _logger.LogInformation(
                        "Scan sonucu alındı. AssetId: {AssetId}, ScanRunId: {ScanRunId}, Success: {Success}",
                        scanResult.AssetId,
                        scanResult.ScanRunId,
                        scanResult.Success);

                    using var scope =
                        _scopeFactory.CreateScope();

                    var findingRepository =
                        scope.ServiceProvider
                            .GetRequiredService<IFindingRepository>();

                    var scanRunRepository =
                        scope.ServiceProvider
                            .GetRequiredService<IScanRunRepository>();

                    var scanRun =
                        await scanRunRepository.GetByIdAsync(
                            scanResult.ScanRunId);

                    if (scanRun == null)
                    {
                        _logger.LogWarning(
                            "ScanRun bulunamadı. ScanRunId: {ScanRunId}",
                            scanResult.ScanRunId);

                        continue;
                    }

                    if (scanResult.Success)
                    {
                        scanRun.Status = "Completed";
                        scanRun.CompletedAt =
                            DateTime.UtcNow;
                        scanRun.Error =
                            string.Empty;

                        await scanRunRepository
                            .SaveChangesAsync();

                        _logger.LogInformation(
                            "ScanRun Completed durumuna getirildi. ScanRunId: {ScanRunId}",
                            scanRun.Id);

                        if (scanResult.Findings.Count > 0)
                        {
                            var findings =
                                scanResult.Findings
                                    .Select(f => new Finding
                                    {
                                        AssetId =
                                            scanResult.AssetId,

                                        ScanRunId =
                                            scanResult.ScanRunId,

                                        CheckId =
                                            f.CheckId,

                                        Path =
                                            f.Path,

                                        StartLine =
                                            f.StartLine,

                                        StartColumn =
                                            f.StartColumn,

                                        EndLine =
                                            f.EndLine,

                                        EndColumn =
                                            f.EndColumn,

                                        Message =
                                            f.Message,

                                        Category =
                                            f.Category,

                                        Severity =
                                            f.Severity,

                                        Confidence =
                                            f.Confidence,

                                        Impact =
                                            f.Impact,

                                        Cwe =
                                            f.Cwe,

                                        Owasp =
                                            f.Owasp,

                                        VulnerabilityClass =
                                            f.VulnerabilityClass,

                                        Reference =
                                            f.Reference,

                                        CreatedAt =
                                            DateTime.UtcNow
                                    })
                                    .ToList();

                            await findingRepository
                                .AddRangeAsync(findings);

                            await findingRepository
                                .SaveChangesAsync();

                            _logger.LogInformation(
                                "{Count} adet finding veritabanına kaydedildi. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
                                findings.Count,
                                scanResult.AssetId,
                                scanResult.ScanRunId);
                        }
                        else
                        {
                            _logger.LogInformation(
                                "Scan sonucunda herhangi bir finding bulunamadı. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
                                scanResult.AssetId,
                                scanResult.ScanRunId);
                        }
                    }
                    else
                    {
                        scanRun.Status = "Failed";
                        scanRun.CompletedAt =
                            DateTime.UtcNow;
                        scanRun.Error =
                            scanResult.Error;

                        await scanRunRepository
                            .SaveChangesAsync();

                        _logger.LogWarning(
                            "Asset scan başarısız oldu. AssetId: {AssetId}, ScanRunId: {ScanRunId}, Error: {Error}",
                            scanResult.AssetId,
                            scanResult.ScanRunId,
                            scanResult.Error);

                        _logger.LogWarning(
                            "Semgrep Output:\n{Output}",
                            scanResult.Output);
                    }
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(
                        ex,
                        "Kafka scan result mesajı tüketilirken hata oluştu.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Scan result işlenirken beklenmeyen hata oluştu.");
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Uygulama kapatılırken beklenen durum.
        }
        finally
        {
            consumer.Close();

            _logger.LogInformation(
                "Kafka scan result consumer durduruldu.");
        }
    }
}