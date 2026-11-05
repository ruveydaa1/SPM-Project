
namespace UserManagement.Domain.Entities;

public class Finding
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public int ScanRunId { get; set; }

    // Scanner'ın kendi kural veya kontrol kimliği
    public string CheckId { get; set; } = string.Empty;

    // CVE, GHSA veya başka bir zafiyet kimliği
    public string Identifier { get; set; } = string.Empty;

    // CVE, GHSA, SemgrepRule vb.
    public string IdentifierType { get; set; } = string.Empty;

    // Bulgunun kısa adı
    public string Title { get; set; } = string.Empty;

    // Etkilenen dosya veya hedef
    public string Path { get; set; } = string.Empty;

    // Kaynak kodu konum bilgileri
    public int? StartLine { get; set; }

    public int? StartColumn { get; set; }

    public int? EndLine { get; set; }

    public int? EndColumn { get; set; }

    // Bulgunun açıklaması
    public string Message { get; set; } = string.Empty;

    // SAST, SCA, Misconfiguration, Secret
    public string Category { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    // Etkilenen paket bilgileri
    public string PackageName { get; set; } = string.Empty;

    public string InstalledVersion { get; set; } = string.Empty;

    public string FixedVersion { get; set; } = string.Empty;

    // Open, Resolved, FalsePositive
    public string Status { get; set; } = "Open";

    public string Confidence { get; set; } = string.Empty;

    public string Impact { get; set; } = string.Empty;

    public string Cwe { get; set; } = string.Empty;

    public string Owasp { get; set; } = string.Empty;

    public string VulnerabilityClass { get; set; } = string.Empty;

    public string Reference { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Asset? Asset { get; set; }

    public ScanRun? ScanRun { get; set; }
}
