
namespace UserManagement.Application.DTOs.Scan;

public class ScheduleScanRequest
{
    public string Scanner { get; set; } = "Semgrep";

    public DateTime ScheduledAt { get; set; }
}
