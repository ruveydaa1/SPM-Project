using System.Text.Json;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class SarifExportService : ISarifExportService
{
    private const string SarifSchema =
        "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json";

    private readonly IScanRunRepository _scanRunRepository;

    public SarifExportService(IScanRunRepository scanRunRepository)
    {
        _scanRunRepository = scanRunRepository;
    }

    public async Task<string?> GenerateSarifAsync(int scanRunId)
    {
        var scanRun = await _scanRunRepository.GetByIdAsync(scanRunId);

        if (scanRun == null)
            return null;

        if (!string.Equals(
                scanRun.Status,
                "Completed",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "SARIF raporu yalnızca tamamlanmış taramalar için oluşturulabilir.");
        }

        var findings = scanRun.Findings.ToList();

        // Her Check ID için tek bir SARIF rule oluşturulur.
        var rules = findings
            .GroupBy(GetRuleId)
            .Select(group =>
            {
                var firstFinding = group.First();
                var ruleId = group.Key;

                var rule = new Dictionary<string, object?>
                {
                    ["id"] = ruleId,
                    ["name"] = string.IsNullOrWhiteSpace(firstFinding.Title)
                        ? ruleId
                        : firstFinding.Title
                };

                var helpUri = group
                    .Select(finding => finding.Reference)
                    .FirstOrDefault(IsValidUrl);

                if (helpUri != null)
                    rule["helpUri"] = helpUri;

                return rule;
            })
            .ToList();

        // Her Finding için ayrı bir SARIF result oluşturulur.
        var results = findings.Select(finding =>
        {
            var result = new Dictionary<string, object?>
            {
                ["ruleId"] = GetRuleId(finding),
                ["level"] = MapSeverity(finding.Severity),
                ["message"] = new
                {
                    text = !string.IsNullOrWhiteSpace(finding.Message)
                        ? finding.Message.Trim()
                        : !string.IsNullOrWhiteSpace(finding.Title)
                            ? finding.Title.Trim()
                            : $"{scanRun.Scanner} security finding"
                }
            };

            // Yalnızca dolu metadata alanları eklenir.
            var properties = new Dictionary<string, object?>
            {
                ["findingId"] = finding.Id
            };

            AddIfNotEmpty(properties, "category", finding.Category);
            AddIfNotEmpty(properties, "severity", finding.Severity);
            AddIfNotEmpty(properties, "identifier", finding.Identifier);
            AddIfNotEmpty(properties, "identifierType", finding.IdentifierType);
            AddIfNotEmpty(properties, "cwe", finding.Cwe);
            AddIfNotEmpty(properties, "owasp", finding.Owasp);
            AddIfNotEmpty(properties, "vulnerabilityClass", finding.VulnerabilityClass);
            AddIfNotEmpty(properties, "packageName", finding.PackageName);
            AddIfNotEmpty(properties, "installedVersion", finding.InstalledVersion);
            AddIfNotEmpty(properties, "fixedVersion", finding.FixedVersion);
            AddIfNotEmpty(properties, "confidence", finding.Confidence);
            AddIfNotEmpty(properties, "impact", finding.Impact);
            AddIfNotEmpty(properties, "status", finding.Status);
            AddIfNotEmpty(properties, "reference", finding.Reference);

            result["properties"] = properties;

            var location = CreateLocation(finding);

            if (location != null)
                result["locations"] = new[] { location };

            return result;
        }).ToList();

        var sarifOutput = new Dictionary<string, object?>
        {
            ["$schema"] = SarifSchema,
            ["version"] = "2.1.0",
            ["runs"] = new[]
            {
                new
                {
                    tool = new
                    {
                        driver = new
                        {
                            name = string.IsNullOrWhiteSpace(scanRun.Scanner)
                                ? "SPM"
                                : scanRun.Scanner.Trim(),
                            version = "1.0.0",
                            informationUri = "https://github.com/ruveydaa1/SPM-Project",
                            rules
                        }
                    },
                    results,
                    properties = new
                    {
                        scanRunId = scanRun.Id,
                        scanner = scanRun.Scanner,
                        source = scanRun.Source,
                        startedAt = scanRun.StartedAt,
                        completedAt = scanRun.CompletedAt
                    }
                }
            }
        };

        return JsonSerializer.Serialize(
            sarifOutput,
            new JsonSerializerOptions
            {
                WriteIndented = true
            });
    }

    private static string GetRuleId(Finding finding)
    {
        return string.IsNullOrWhiteSpace(finding.CheckId)
            ? $"finding-{finding.Id}"
            : finding.CheckId;
    }

    private static string MapSeverity(string? severity)
    {
        return severity?.Trim().ToLowerInvariant() switch
        {
            "blocker" or "critical" or "high" or "error"
                => "error",

            "major" or "medium" or "warning"
                => "warning",

            "moderate"
                => "warning",

            "minor" or "low" or "note"
                => "note",

            "info" or "informational"
                => "note",

            // Bilinmeyen severity değerleri gözden kaçmasın diye warning olarak işaretlenir.
            _ => "warning"
        };
    }

    private static void AddIfNotEmpty(
        Dictionary<string, object?> properties,
        string key,
        string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
            properties[key] = value;
    }

    private static bool IsValidUrl(string? value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
               && (uri.Scheme == Uri.UriSchemeHttp
                   || uri.Scheme == Uri.UriSchemeHttps);
    }

    private static object? CreateLocation(Finding finding)
    {
        if (string.IsNullOrWhiteSpace(finding.Path))
            return null;

        var region = new Dictionary<string, int>();

        if (finding.StartLine.HasValue && finding.StartLine.Value > 0)
            region["startLine"] = finding.StartLine.Value;

        if (finding.StartColumn.HasValue && finding.StartColumn.Value > 0)
            region["startColumn"] = finding.StartColumn.Value;

        if (finding.EndLine.HasValue && finding.EndLine.Value > 0)
            region["endLine"] = finding.EndLine.Value;

        if (finding.EndColumn.HasValue && finding.EndColumn.Value > 0)
            region["endColumn"] = finding.EndColumn.Value;

        var physicalLocation = new Dictionary<string, object?>
        {
            ["artifactLocation"] = new
            {
                uri = finding.Path.Replace('\\', '/')
            }
        };

        if (region.Count > 0)
            physicalLocation["region"] = region;

        return new
        {
            physicalLocation
        };
    }
}
