using System.Text.Json;
using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Infrastructure.Hubs;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Services;

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
            "Kafka scan progress consumer started. Topic: {Topic}",
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
                            "Failed to deserialize Kafka scan progress message.");

                        continue;
                    }

                    _logger.LogInformation(
                        "Scan progress received. AssetId: {AssetId}, ScanRunId: {ScanRunId}, Status: {Status}, Message: {Message}",
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
                        "An error occurred while consuming the Kafka scan progress message.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "An unexpected error occurred while processing scan progress.");
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Uygulama kapatÄ±lÄ±rken beklenen durum.
        }
        finally
        {
            consumer.Close();

            _logger.LogInformation(
                "Kafka scan progress consumer stopped.");
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