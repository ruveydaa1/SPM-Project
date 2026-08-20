using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Interfaces;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/scan-runs")]
[Authorize]
public class ScanRunController : ControllerBase
{
    private readonly IScanRunRepository _scanRunRepository;

    public ScanRunController(
        IScanRunRepository scanRunRepository)
    {
        _scanRunRepository = scanRunRepository;
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

        return Ok(scanRun);
    }

    // GET: api/scan-runs/asset/1
    [HttpGet("asset/{assetId:int}")]
    public async Task<IActionResult> GetByAssetId(int assetId)
    {
        var scanRuns =
            await _scanRunRepository.GetByAssetIdAsync(assetId);

        return Ok(scanRuns);
    }
}