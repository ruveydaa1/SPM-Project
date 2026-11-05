using System.Text.Json.Serialization;
namespace UserManagement.Domain.Entities;

public class ScanRun
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public int? StartedByUserId { get; set; }

    public string Scanner { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public string Status { get; set; } = "Started";

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    public string Error { get; set; } = string.Empty;

    public Asset? Asset { get; set; }

    public User? StartedByUser { get; set; }

    [JsonIgnore]
    public ICollection<Finding> Findings { get; set; } = new List<Finding>();
}