using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Application.DTOs.Scan;
using Application.Interfaces;
using Infrastructure.Persistence;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/scan-runs")]
[Authorize(Roles = "SuperAdmin,Admin,Developer")]
public class ScanRunController : ControllerBase
{
    private readonly IScanRunRepository _scanRunRepository;
    private readonly IFindingRepository _findingRepository;
    private readonly ISarifExportService _sarifExportService;
    private readonly ILogger<ScanRunController> _logger;
    private readonly AppDbContext _dbContext;


    public ScanRunController(
        IScanRunRepository scanRunRepository,
        IFindingRepository findingRepository,
        ILogger<ScanRunController> logger,
        ISarifExportService sarifExportService,
        AppDbContext dbContext)
    {
        _scanRunRepository = scanRunRepository;
        _findingRepository = findingRepository;
        _logger = logger;
        _sarifExportService = sarifExportService;
        _dbContext = dbContext;
    }
    //butun tarama kayitlarini ve bulgularini getirir
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
                StartedByUserId = scanRun.StartedByUserId,
                StartedByUserName = scanRun.StartedByUser == null
                    ? null
                    : $"{scanRun.StartedByUser.FirstName} {scanRun.StartedByUser.LastName}",
                StartedByUserRole = scanRun.StartedByUser?.UserRoles
                    .Select(ur => ur.Role.Name)
                    .FirstOrDefault(),
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
                        Identifier = f.Identifier,
                        IdentifierType = f.IdentifierType,
                        Title = f.Title,
                        Path = f.Path,
                        StartLine = f.StartLine,
                        StartColumn = f.StartColumn,
                        EndLine = f.EndLine,
                        EndColumn = f.EndColumn,
                        Message = f.Message,
                        Category = f.Category,
                        Severity = f.Severity,
                        PackageName = f.PackageName,
                        InstalledVersion = f.InstalledVersion,
                        FixedVersion = f.FixedVersion,

                        Status = f.Status,
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
    //belirli bir taramanin detaylarini getirir
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
                message = "Scan run not found."
            });
        }

        var result = new ScanRunDto
        {
            Id = scanRun.Id,
            AssetId = scanRun.AssetId,
            StartedByUserId = scanRun.StartedByUserId,
            StartedByUserName = scanRun.StartedByUser == null
                ? null
                : $"{scanRun.StartedByUser.FirstName} {scanRun.StartedByUser.LastName}",
            StartedByUserRole = scanRun.StartedByUser?.UserRoles
                .Select(ur => ur.Role.Name)
                .FirstOrDefault(),
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

    // GET: api/scan-runs/1/sarif
    // Tamamlanmış taramanın bulgularını SARIF formatında indirir.
    [HttpGet("{id:int}/sarif")]
    public async Task<IActionResult> DownloadSarif(int id)
    {
        try
        {
            var sarifJson =
                await _sarifExportService.GenerateSarifAsync(id);

            if (sarifJson == null)
            {
                return NotFound(new
                {
                    message = "Scan run not found."
                });
            }

            var fileBytes = System.Text.Encoding.UTF8.GetBytes(sarifJson);

            return File(
                fileBytes,
                "application/sarif+json",
                $"scan-{id}.sarif");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "SARIF export failed. ScanRunId: {ScanRunId}",
                id);

            return StatusCode(500, new
            {
                message = "An error occurred while generating the SARIF report."
            });
        }
    }
    
    //gelen sonucu isler tarama durumunu gunceller ve bulgulari kaydeder
    // POST: api/scan-runs/result
    [HttpPost("result")]
    [AllowAnonymous]
    public async Task<IActionResult> ReceiveScanResult(
    [FromBody] ScanResult scanResult)
    {
        if (scanResult == null)
        {
            return BadRequest(new
            {
                message = "Scan result cannot be empty."
            });
        }

        _logger.LogInformation(
            "Scan result received. AssetId: {AssetId}, ScanRunId: {ScanRunId}, Success: {Success}",
            scanResult.AssetId,
            scanResult.ScanRunId,
            scanResult.Success);

        var scanRun =
            await _scanRunRepository.GetByIdAsync(
                scanResult.ScanRunId);

        if (scanRun == null)
        {
            return NotFound(new
            {
                message = "Scan run not found."
            });
        }

        var scheduledScan = await _dbContext.ScheduledScans
            .FirstOrDefaultAsync(s => s.ScanRunId == scanRun.Id);

        if (scanResult.Success)
        {
            scanRun.Status = "Completed";
            scanRun.CompletedAt = DateTime.UtcNow;
            scanRun.Error = string.Empty;

            await _scanRunRepository.SaveChangesAsync();

            if (scanResult.Findings.Count > 0)
            {
                var findings =
                    scanResult.Findings
                        .Select(f => new Domain.Entities.Finding
                        {
                            AssetId = scanResult.AssetId,
                            ScanRunId = scanResult.ScanRunId,

                            CheckId = f.CheckId,

                            Identifier = f.Identifier,
                            IdentifierType = f.IdentifierType,
                            Title = string.IsNullOrWhiteSpace(f.Title)
        ? f.Message
        : f.Title,

                            Path = f.Path,

                            StartLine = f.StartLine,
                            StartColumn = f.StartColumn,
                            EndLine = f.EndLine,
                            EndColumn = f.EndColumn,

                            Message = f.Message,
                            Category = f.Category,
                            Severity = f.Severity,

                            PackageName = f.PackageName,
                            InstalledVersion = f.InstalledVersion,
                            FixedVersion = f.FixedVersion,

                            Status = string.IsNullOrWhiteSpace(f.Status)
                                ? "Open"
                                : f.Status,

                            Confidence = f.Confidence,
                            Impact = f.Impact,
                            Cwe = f.Cwe,
                            Owasp = f.Owasp,
                            VulnerabilityClass = f.VulnerabilityClass,
                            Reference = f.Reference,

                            CreatedAt = DateTime.UtcNow
                        })
                        .ToList();

                await _findingRepository.AddRangeAsync(findings);
                await _findingRepository.SaveChangesAsync();

                _logger.LogInformation(
                    "{Count} findings saved to the database. AssetId: {AssetId}, ScanRunId: {ScanRunId}",
                    findings.Count,
                    scanResult.AssetId,
                    scanResult.ScanRunId);
            }

            if (scheduledScan != null)
            {
                scheduledScan.Status = "Completed";
                scheduledScan.CompletedAt = DateTime.UtcNow;
                scheduledScan.Error = string.Empty;

                await _dbContext.SaveChangesAsync();
            }
        }
        else
        {
            scanRun.Status = "Failed";
            scanRun.CompletedAt = DateTime.UtcNow;
            scanRun.Error = scanResult.Error;

            await _scanRunRepository.SaveChangesAsync();

            _logger.LogWarning(
                "Asset scan failed. AssetId: {AssetId}, ScanRunId: {ScanRunId}, Error: {Error}",
                scanResult.AssetId,
                scanResult.ScanRunId,
                scanResult.Error);

            if (scheduledScan != null)
            {
                scheduledScan.Status = "Failed";
                scheduledScan.CompletedAt = DateTime.UtcNow;
                scheduledScan.Error = scanResult.Error ?? string.Empty;

                await _dbContext.SaveChangesAsync();
            }
        }

        return Ok(new
        {
            message = "Scan result processed successfully."
        });
    }

}