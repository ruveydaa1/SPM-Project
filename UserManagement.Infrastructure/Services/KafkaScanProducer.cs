using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;

namespace UserManagement.Infrastructure.Services;

public class KafkaScanProducer
{
    private readonly IConfiguration _configuration;

    public KafkaScanProducer(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendScanRequestAsync(
        int assetId,
        string source,
        string scanner,
        int scanRunId)
    {
        var bootstrapServers =
            _configuration["Kafka:BootstrapServers"]
            ?? "localhost:9092";

        var topic =
            _configuration["Kafka:ScanTopic"]
            ?? "asset-scan";

        var config = new ProducerConfig
        {
            BootstrapServers = bootstrapServers
        };

        var message = new
        {
            AssetId = assetId,
            Source = source,
            Scanner = scanner,
            ScanRunId = scanRunId
        };

        var json = JsonSerializer.Serialize(message);

        using var producer =
            new ProducerBuilder<Null, string>(config).Build();

        await producer.ProduceAsync(
            topic,
            new Message<Null, string>
            {
                Value = json
            });
    }
}