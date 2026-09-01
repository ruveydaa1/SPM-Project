using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Interfaces;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/findings")]
[Authorize(Roles = "SuperAdmin,Admin,Developer")]
public class FindingController : ControllerBase
{
    private readonly IFindingService _findingService;

    public FindingController(IFindingService findingService)
    {
        _findingService = findingService;
    }

    // Sistemdeki tüm vulnerability finding'lerini getirir.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var findings =
            await _findingService.GetAllAsync();

        return Ok(findings);
    }

    // Belirli bir asset'in en son scan'ine ait finding'lerini getirir.
    [HttpGet("asset/{assetId:int}")]
    public async Task<IActionResult> GetByAssetId(int assetId)
    {
        var findings =
            await _findingService.GetByAssetIdAsync(assetId);

        return Ok(findings);
    }

    // Belirli bir finding'i ID'sine göre getirir.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var finding =
            await _findingService.GetByIdAsync(id);

        if (finding == null)
        {
            return NotFound(new
            {
                message = "Finding bulunamadı."
            });
        }

        return Ok(finding);
    }
}