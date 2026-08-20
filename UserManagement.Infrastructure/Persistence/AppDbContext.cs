using Microsoft.EntityFrameworkCore;
using UserManagement.Domain.Entities;

namespace UserManagement.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<Role> Roles { get; set; }

    public DbSet<UserRole> UserRoles { get; set; }

    public DbSet<Asset> Assets { get; set; }

    public DbSet<Finding> Findings { get; set; }

    public DbSet<ScanRun> ScanRuns { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(u => u.Id);

            entity.Property(u => u.Id)
                .HasColumnName("id");

            entity.Property(u => u.FirstName)
                .HasColumnName("first_name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(u => u.LastName)
                .HasColumnName("last_name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(u => u.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .HasColumnName("password_hash")
                .IsRequired();

            entity.Property(u => u.PasswordResetToken)
                .HasColumnName("password_reset_token")
                .HasMaxLength(500);

            entity.Property(u => u.PasswordResetTokenExpiresAt)
                .HasColumnName("password_reset_token_expires_at");

            entity.Property(u => u.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);

            entity.Property(u => u.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(u => u.UpdatedAt)
                .HasColumnName("updated_at");
        });

        // Roles
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");

            entity.HasKey(r => r.Id);

            entity.Property(r => r.Id)
                .HasColumnName("id");

            entity.Property(r => r.Name)
                .HasColumnName("name")
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(r => r.Name)
                .IsUnique();
        });

        // UserRoles
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");

            entity.HasKey(ur => new { ur.UserId, ur.RoleId });

            entity.Property(ur => ur.UserId)
                .HasColumnName("user_id");

            entity.Property(ur => ur.RoleId)
                .HasColumnName("role_id");

            entity.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Assets
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.ToTable("assets");

            entity.HasKey(a => a.Id);

            entity.Property(a => a.Id)
                .HasColumnName("id");

            entity.Property(a => a.Name)
                .HasColumnName("name")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(a => a.Type)
                .HasColumnName("type")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(a => a.Url)
                .HasColumnName("url")
                .HasMaxLength(500);

            entity.Property(a => a.Description)
                .HasColumnName("description")
                .HasMaxLength(1000);

            entity.Property(a => a.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);

            entity.Property(a => a.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(a => a.UpdatedAt)
                .HasColumnName("updated_at");
        });

        // ScanRuns
        modelBuilder.Entity<ScanRun>(entity =>
        {
            entity.ToTable("scan_runs");

            entity.HasKey(s => s.Id);

            entity.Property(s => s.Id)
                .HasColumnName("id");

            entity.Property(s => s.AssetId)
                .HasColumnName("asset_id")
                .IsRequired();

            entity.Property(s => s.Scanner)
                .HasColumnName("scanner")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(s => s.Source)
                .HasColumnName("source")
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(s => s.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(s => s.StartedAt)
                .HasColumnName("started_at");

            entity.Property(s => s.CompletedAt)
                .HasColumnName("completed_at");

            entity.Property(s => s.Error)
                .HasColumnName("error")
                .HasMaxLength(5000);

            entity.HasOne(s => s.Asset)
                .WithMany()
                .HasForeignKey(s => s.AssetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Findings
        modelBuilder.Entity<Finding>(entity =>
        {
            entity.ToTable("findings");

            entity.HasKey(f => f.Id);

            entity.Property(f => f.Id)
                .HasColumnName("id");

            entity.Property(f => f.AssetId)
                .HasColumnName("asset_id")
                .IsRequired();

            entity.Property(f => f.CheckId)
                .HasColumnName("check_id")
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(f => f.Path)
                .HasColumnName("path")
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(f => f.StartLine)
                .HasColumnName("start_line");

            entity.Property(f => f.StartColumn)
                .HasColumnName("start_column");

            entity.Property(f => f.EndLine)
                .HasColumnName("end_line");

            entity.Property(f => f.EndColumn)
                .HasColumnName("end_column");

            entity.Property(f => f.Message)
                .HasColumnName("message")
                .HasMaxLength(5000);

            entity.Property(f => f.Category)
                .HasColumnName("category")
                .HasMaxLength(100);

            entity.Property(f => f.Severity)
                .HasColumnName("severity")
                .HasMaxLength(50);

            entity.Property(f => f.Confidence)
                .HasColumnName("confidence")
                .HasMaxLength(50);

            entity.Property(f => f.Impact)
                .HasColumnName("impact")
                .HasMaxLength(50);

            entity.Property(f => f.Cwe)
                .HasColumnName("cwe")
                .HasMaxLength(500);

            entity.Property(f => f.Owasp)
                .HasColumnName("owasp")
                .HasMaxLength(500);

            entity.Property(f => f.VulnerabilityClass)
                .HasColumnName("vulnerability_class")
                .HasMaxLength(500);

            entity.Property(f => f.Reference)
                .HasColumnName("reference")
                .HasMaxLength(1000);

            entity.Property(f => f.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(f => f.ScanRunId)
                .HasColumnName("scan_run_id")
                .IsRequired();

            entity.HasOne(f => f.Asset)
                .WithMany()
                .HasForeignKey(f => f.AssetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.ScanRun)
                .WithMany(s => s.Findings)
                .HasForeignKey(f => f.ScanRunId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}