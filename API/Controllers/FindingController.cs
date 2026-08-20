using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Interfaces;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/findings")]
[Authorize]
public class FindingController : ControllerBase
{
    private readonly IFindingService _findingService;

    public FindingController(IFindingService findingService)
    {
        _findingService = findingService;
    }

    [HttpGet("asset/{assetId:int}")]
    public async Task<IActionResult> GetByAssetId(int assetId)
    {
        var findings =
            await _findingService.GetByAssetIdAsync(assetId);

        return Ok(findings);
    }
}