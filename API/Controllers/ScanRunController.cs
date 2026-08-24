using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.DTOs.Scan;
using UserManagement.Application.Interfaces;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/scan-runs")]
[Authorize(Roles = "SuperAdmin,Admin,Developer")]
public class ScanRunController : ControllerBase
{
    private readonly IScanRunRepository _scanRunRepository;

    public ScanRunController(
        IScanRunRepository scanRunRepository)
    {
        _scanRunRepository = scanRunRepository;
    }

    // GET: api/scan-runs
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var scanRuns =
            await _scanRunRepository.GetAllAsync();

        var result = scanRuns
            .Select(scanRun => new ScanRunDto
            {
                Id = scanRun.Id,
                AssetId = scanRun.AssetId,
                Scanner = scanRun.Scanner,
                Source = scanRun.Source,
                Status = scanRun.Status,
                StartedAt = scanRun.StartedAt,
                CompletedAt = scanRun.CompletedAt,
                Error = scanRun.Error,

                Findings = scanRun.Findings
                    .Select(f => new ScanFindingDto
                    {
                        CheckId = f.CheckId,
                        Path = f.Path,
                        StartLine = f.StartLine,
                        StartColumn = f.StartColumn,
                        EndLine = f.EndLine,
                        EndColumn = f.EndColumn,
                        Message = f.Message,
                        Category = f.Category,
                        Severity = f.Severity,
                        Confidence = f.Confidence,
                        Impact = f.Impact,
                        Cwe = f.Cwe,
                        Owasp = f.Owasp,
                        VulnerabilityClass = f.VulnerabilityClass,
                        Reference = f.Reference
                    })
                    .ToList()
            })
            .ToList();

        return Ok(result);
    }

    // GET: api/scan-runs/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var scanRun =
            await _scanRunRepository.GetByIdAsync(id);

        if (scanRun == null)
        {
            return NotFound(new
            {
                message = "ScanRun bulunamadı."
            });
        }

        var result = new ScanRunDto
        {
            Id = scanRun.Id,
            AssetId = scanRun.AssetId,
            Scanner = scanRun.Scanner,
            Source = scanRun.Source,
            Status = scanRun.Status,
            StartedAt = scanRun.StartedAt,
            CompletedAt = scanRun.CompletedAt,
            Error = scanRun.Error,

            Findings = scanRun.Findings
                .Select(f => new ScanFindingDto
                {
                    CheckId = f.CheckId,
                    Path = f.Path,
                    StartLine = f.StartLine,
                    StartColumn = f.StartColumn,
                    EndLine = f.EndLine,
                    EndColumn = f.EndColumn,
                    Message = f.Message,
                    Category = f.Category,
                    Severity = f.Severity,
                    Confidence = f.Confidence,
                    Impact = f.Impact,
                    Cwe = f.Cwe,
                    Owasp = f.Owasp,
                    VulnerabilityClass = f.VulnerabilityClass,
                    Reference = f.Reference
                })
                .ToList()
        };

        return Ok(result);
    }

}