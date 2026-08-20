namespace UserManagement.Application.DTOs.Scan;

public class ScanRunResponse
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public string Scanner { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string Error { get; set; } = string.Empty;

    public List<ScanFindingResponse> Findings { get; set; } = new();
}

public class ScanFindingResponse
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public int ScanRunId { get; set; }

    public string CheckId { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public int StartLine { get; set; }

    public int StartColumn { get; set; }

    public int EndLine { get; set; }

    public int EndColumn { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Confidence { get; set; } = string.Empty;

    public string Impact { get; set; } = string.Empty;

    public string Cwe { get; set; } = string.Empty;

    public string Owasp { get; set; } = string.Empty;

    public string VulnerabilityClass { get; set; } = string.Empty;

    public string Reference { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}