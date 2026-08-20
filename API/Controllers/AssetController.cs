using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.DTOs.Assets;
using UserManagement.Application.DTOs.Scan;
using UserManagement.Application.Interfaces;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Services;

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

    public AssetsController(
        IAssetService assetService,
        IScanRunRepository scanRunRepository,
        KafkaScanProducer kafkaScanProducer,
        IScanRunService scanRunService)
    {
        _assetService = assetService;
        _scanRunRepository = scanRunRepository;
        _kafkaScanProducer = kafkaScanProducer;
        _scanRunService = scanRunService;
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
                message = "Asset bulunamadı."
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
                message = "Asset bulunamadı."
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
                message = "Asset başarıyla oluşturuldu.",
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
                message = "Asset başarıyla güncellendi."
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
                message = "Asset başarıyla silindi."
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
                message = "Asset bulunamadı."
            });
        }

        if (!request.Scanner.Equals(
                "Semgrep",
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Şu anda sadece Semgrep desteklenmektedir."
            });
        }

        if (string.IsNullOrWhiteSpace(asset.Url))
        {
            return BadRequest(new
            {
                message = "Bu asset için repository URL tanımlanmamış."
            });
        }

        var scanRun = new ScanRun
        {
            AssetId = id,
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
                message = "Scan başlatıldı.",
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
                message = "Scan başlatılamadı.",
                assetId = id,
                scanRunId = scanRun.Id,
                status = scanRun.Status,
                error = ex.Message
            });
        }
    }
}