
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin,Admin,Developer")]
public class ScannersController : ControllerBase
{
    public static readonly IReadOnlyList<string> SupportedScanners =
        Array.AsReadOnly(new[]
        {
            "Semgrep",
            "Trivy",
            "Gitleaks",
            "SonarQube"
        });

    [HttpGet]
    public IActionResult GetScanners()
    {
        return Ok(SupportedScanners);
    }
}
