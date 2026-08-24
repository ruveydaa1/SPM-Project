namespace UserManagement.Application.DTOs.Scan;

public class ScanRunDto
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public string Scanner { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string Error { get; set; } = string.Empty;

    public List<ScanFindingDto> Findings { get; set; }
        = new();
}