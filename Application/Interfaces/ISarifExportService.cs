namespace Application.Interfaces;

public interface ISarifExportService
{
    Task<string?> GenerateSarifAsync(int scanRunId);
}