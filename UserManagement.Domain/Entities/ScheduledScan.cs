
namespace UserManagement.Domain.Entities;

public class ScheduledScan
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public int? ScheduledByUserId { get; set; }

    public string Scanner { get; set; } = "Semgrep";

    public string Status { get; set; } = "Scheduled";

    public DateTime ScheduledAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public int? ScanRunId { get; set; }

    public string Error { get; set; } = string.Empty;

    public Asset? Asset { get; set; }

    public User? ScheduledByUser { get; set; }

    public ScanRun? ScanRun { get; set; }
}
