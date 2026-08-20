namespace UserManagement.Application.DTOs.Assets;

public class CreateAssetRequest
{
    public string Name { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}