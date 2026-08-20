using System.Text.Json;
using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UserManagement.Infrastructure.Hubs;
using Microsoft.Extensions.DependencyInjection;

namespace UserManagement.Infrastructure.Services;

public class KafkaScanProgressConsumer : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly IHubContext<ScanProgressHub> _hubContext;
    private readonly ILogger<KafkaScanProgressConsumer> _logger;

    public KafkaScanProgressConsumer(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        IHubContext<ScanProgressHub> hubContext,
        ILogger<KafkaScanProgressConsumer> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        var bootstrapServers =
            _configuration["Kafka:BootstrapServers"]
            ?? "localhost:9092";

        var topic =
            _configuration["Kafka:ProgressTopic"]
            ?? "asset-scan-progress";

        var groupId =
            _configuration["Kafka:ProgressConsumerGroup"]
            ?? "asset-scan-progress-workers";

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
            "Kafka scan progress consumer başlatıldı. Topic: {Topic}",
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

                    var progress =
                        JsonSerializer.Deserialize<ScanProgressMessage>(
                            result.Message.Value);

                    if (progress == null)
                    {
                        _logger.LogWarning(
                            "Kafka scan progress mesajı çözümlenemedi.");

                        continue;
                    }

                    _logger.LogInformation(
                        "Scan progress alındı. AssetId: {AssetId}, ScanRunId: {ScanRunId}, Status: {Status}, Message: {Message}",
                        progress.AssetId,
                        progress.ScanRunId,
                        progress.Status,
                        progress.Message);

                    await _hubContext.Clients
                        .All
                        .SendAsync(
                            "ScanProgress",
                            progress,
                            stoppingToken);
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(
                        ex,
                        "Kafka scan progress mesajı tüketilirken hata oluştu.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Scan progress işlenirken beklenmeyen hata oluştu.");
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
                "Kafka scan progress consumer durduruldu.");
        }
    }

    private class ScanProgressMessage
    {
        public int AssetId { get; set; }

        public int ScanRunId { get; set; }

        public string Status { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; }
    }
}