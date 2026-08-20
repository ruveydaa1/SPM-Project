namespace UserManagement.Application.DTOs.Scan;

public class ScanResponse
{
    public bool Success { get; set; }

    public string Scanner { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public string Output { get; set; } = string.Empty;

    public string Error { get; set; } = string.Empty;

    public List<ScanFindingDto> Findings { get; set; } = new();
}