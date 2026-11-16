using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagement.Application.DTOs.Assets;
using UserManagement.Application.DTOs.Scan;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Services;
using UserManagement.Infrastructure.Persistence;
using System.Security.Claims;
using Hangfire;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Admin,Developer")]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;
    private readonly IScanRunRepository _scanRunRepository;
    private readonly KafkaScanProducer _kafkaScanProducer;
    private readonly IScanRunService _scanRunService;
    private readonly AppDbContext _dbContext;

    public AssetsController(
        IAssetService assetService,
        IScanRunRepository scanRunRepository,
        KafkaScanProducer kafkaScanProducer,
        IScanRunService scanRunService,
        AppDbContext dbContext)
    {
        _assetService = assetService;
        _scanRunRepository = scanRunRepository;
        _kafkaScanProducer = kafkaScanProducer;
        _scanRunService = scanRunService;
        _dbContext = dbContext;
    }

    // GET: api/assets
    [HttpGet]
    public async Task<IActionResult> GetAssets()
    {
        var assets = await _assetService.GetAssetsAsync();

        return Ok(assets);
    }

    // GET: api/assets/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAsset(int id)
    {
        var asset = await _assetService.GetAssetAsync(id);

        if (asset == null)
        {
            return NotFound(new
            {
                message = "Asset not found."
            });
        }

        return Ok(asset);
    }

    // GET: api/assets/7/scan-runs
    [HttpGet("{id}/scan-runs")]
    public async Task<IActionResult> GetScanRuns(int id)
    {
        var asset = await _assetService.GetAssetAsync(id);

        if (asset == null)
        {
            return NotFound(new
            {
                message = "Asset not found."
            });
        }

        var scanRuns = await _scanRunService.GetByAssetIdAsync(id);

        return Ok(scanRuns);
    }

    // POST: api/assets
    [HttpPost]
    public async Task<IActionResult> CreateAsset(
        CreateAssetRequest request)
    {
        try
        {
            var assetId =
                await _assetService.CreateAssetAsync(request);

            return Ok(new
            {
                message = "Asset created successfully.",
                assetId
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // PUT: api/assets/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAsset(
        int id,
        UpdateAssetRequest request)
    {
        try
        {
            await _assetService.UpdateAssetAsync(id, request);

            return Ok(new
            {
                message = "Asset updated successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // DELETE: api/assets/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        try
        {
            await _assetService.DeleteAssetAsync(id);

            return Ok(new
            {
                message = "Asset deleted successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }


    // POST: api/assets/1/schedule-scan

    [HttpPost("{id:int}/schedule-scan")]
    public async Task<IActionResult> ScheduleScan(
        int id,
        [FromBody] ScheduleScanRequest request)
    {
        var asset = await _assetService.GetAssetAsync(id);

        if (asset == null)
            return NotFound(new { message = "Asset not found." });

        if (!asset.IsActive)
            return BadRequest(new { message = "Cannot schedule a scan for an inactive asset." });

        if (string.IsNullOrWhiteSpace(asset.Url))
            return BadRequest(new { message = "No repository URL is configured for this asset." });

        if (!ScannersController.SupportedScanners.Contains(
                request.Scanner ?? "",
                StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Unsupported scanner. Please select a valid scanner."
            });
        }

        var turkeyTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");

        var scheduledLocalTime = DateTime.SpecifyKind(
            request.ScheduledAt,
            DateTimeKind.Unspecified);

        var scheduledUtc = TimeZoneInfo.ConvertTimeToUtc(
            scheduledLocalTime,
            turkeyTimeZone);

        if (scheduledUtc <= DateTime.UtcNow)
            return BadRequest(new { message = "The scheduled scan time must be in the future." });

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        int? userId = int.TryParse(userIdClaim, out var parsedUserId)
            ? parsedUserId
            : null;

        var scheduledScan = new ScheduledScan
        {
            AssetId = id,
            ScheduledByUserId = userId,
            Scanner = request.Scanner,
            Status = "Scheduled",
            ScheduledAt = DateTime.SpecifyKind(scheduledUtc, DateTimeKind.Utc),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ScheduledScans.Add(scheduledScan);
        await _dbContext.SaveChangesAsync();

        try
        {
            var jobId = BackgroundJob.Schedule<ScheduledScanJob>(
                job => job.ExecuteAsync(
                    id,
                    userId,
                    request.Scanner,
                    scheduledScan.Id),
                new DateTimeOffset(scheduledUtc, TimeSpan.Zero));

            return Ok(new
            {
                message = "Scan scheduled successfully.",
                assetId = id,
                scheduledScanId = scheduledScan.Id,
                jobId,
                scanner = request.Scanner,
                scheduledAtUtc = scheduledUtc,
                status = scheduledScan.Status
            });
        }
        catch (Exception ex)
        {
            scheduledScan.Status = "Failed";
            scheduledScan.Error = ex.Message;
            scheduledScan.CompletedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return StatusCode(500, new
            {
                message = "Failed to schedule the scan.",
                scheduledScanId = scheduledScan.Id,
                error = ex.Message
            });
        }
    }


    // GET: api/assets/1/scheduled-scans
    [HttpGet("{id:int}/scheduled-scans")]
    public async Task<IActionResult> GetScheduledScans(int id)
    {
        var asset = await _assetService.GetAssetAsync(id);

        if (asset == null)
        {
            return NotFound(new
            {
                message = "Asset not found."
            });
        }

        var scheduledScans = await _dbContext.ScheduledScans
            .Where(s => s.AssetId == id)
            .OrderByDescending(s => s.ScheduledAt)
            .Select(s => new
            {
                s.Id,
                s.AssetId,
                s.Scanner,
                s.Status,
                s.ScheduledAt,
                s.CreatedAt,
                s.StartedAt,
                s.CompletedAt,
                s.ScanRunId,
                s.Error,
                ScheduledByUser = s.ScheduledByUser == null
                    ? null
                    : $"{s.ScheduledByUser.FirstName} {s.ScheduledByUser.LastName}"
            })
            .ToListAsync();

        return Ok(scheduledScans);
    }




    // POST: api/assets/1/scan
    [HttpPost("{id}/scan")]
    public async Task<IActionResult> ScanAsset(
        int id,
        [FromBody] ScanRequest request)
    {
        var asset =
            await _assetService.GetAssetAsync(id);

        if (asset == null)
        {
            return NotFound(new
            {
                message = "Asset not found."
            });
        }

        if(!ScannersController.SupportedScanners.Contains(
                request.Scanner ?? "",
                StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Unsupported scanner. Please select a valid scanner."
            });
        }

        if (string.IsNullOrWhiteSpace(asset.Url))
        {
            return BadRequest(new
            {
                message = "No repository URL is configured for this asset."
            });
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var scanRun = new ScanRun
        {
            AssetId = id,
            StartedByUserId = int.TryParse(userIdClaim, out var userId)
                ? userId
                : null,
            Scanner = request.Scanner,
            Source = asset.Url,
            Status = "Started",
            StartedAt = DateTime.UtcNow
        };

        await _scanRunRepository.AddAsync(scanRun);
        await _scanRunRepository.SaveChangesAsync();

        try
        {
            await _kafkaScanProducer.SendScanRequestAsync(
                id,
                asset.Url,
                request.Scanner,
                scanRun.Id);

            return Ok(new
            {
                message = "Scan started.",
                assetId = id,
                scanRunId = scanRun.Id,
                scanner = request.Scanner,
                source = asset.Url,
                status = scanRun.Status
            });
        }
        catch (Exception ex)
        {
            scanRun.Status = "Failed";
            scanRun.CompletedAt = DateTime.UtcNow;
            scanRun.Error = ex.Message;

            await _scanRunRepository.SaveChangesAsync();

            return StatusCode(500, new
            {
                message = "Failed to start the scan.",
                assetId = id,
                scanRunId = scanRun.Id,
                status = scanRun.Status,
                error = ex.Message
            });
        }
    }
}