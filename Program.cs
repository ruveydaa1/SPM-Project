using Application.Interfaces;
using Application.Services;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Infrastructure.Persistence;
using Infrastructure.Hubs;
using Hangfire;
using Hangfire.PostgreSql;

var builder = WebApplication.CreateBuilder(args);

// Hangfire - PostgreSQL Ã¼zerinden zamanlanmÄ±ÅŸ gÃ¶revler
builder.Services.AddHangfire(configuration =>
    configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options =>
            options.UseNpgsqlConnection(
                builder.Configuration.GetConnectionString("DefaultConnection")
            )
        )
);

builder.Services.AddHangfireServer();

// PostgreSQL baÄŸlantÄ±sÄ±
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
            npgsqlOptions.MigrationsAssembly("SPM")
    ));


// Dependency Injection
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();

builder.Services.AddScoped<IFindingService, FindingService>();
builder.Services.AddScoped<IFindingRepository, FindingRepository>();
builder.Services.AddScoped<IScanRunRepository, ScanRunRepository>();
builder.Services.AddScoped<IScanRunService, ScanRunService>();
builder.Services.AddScoped<ISarifExportService, SarifExportService>();


builder.Services.AddSingleton<KafkaScanProducer>();
builder.Services.AddTransient<ScheduledScanJob>();
builder.Services.AddHostedService<KafkaScanProgressConsumer>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddScoped<IEmailService, EmailService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!
                )
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Bu iÅŸlemi gerÃ§ekleÅŸtirmek iÃ§in giriÅŸ yapmanÄ±z gerekiyor."
                });
            },

            OnForbidden = async context =>
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Bu iÅŸlemi gerÃ§ekleÅŸtirmek iÃ§in yetkiniz yok."
                });
            }
        };
    });

// Authorization
builder.Services.AddAuthorization();

// Controller'lar
builder.Services.AddControllers();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Application servisleri
builder.Services.AddScoped<IAuthService, AuthService>();

// Infrastructure servisleri
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();

// OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseHangfireDashboard("/hangfire");

// Authentication â†’ Authorization sÄ±rasÄ± Ã¶nemli
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<ScanProgressHub>("/hubs/scan-progress");

app.Run();