
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(
        AppDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // ==========================================
    // REGISTER EMPLOYEE
    // ==========================================

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        string email = dto.Email.Trim().ToLowerInvariant();

        bool emailExists = await _context.Users
            .AnyAsync(u => u.Email == email);

        if (emailExists)
            throw new InvalidOperationException(
                "Email already registered.");

        var employeeRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Employee");

        if (employeeRole == null)
            throw new InvalidOperationException(
                "Employee role not found.");

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.UserRoles.Add(new UserRole
        {
            RoleId = employeeRole.Id
        });

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return await GenerateAuthResponseAsync(
            user,
            new List<string> { employeeRole.Name }
        );
    }

    // ==========================================
    // LOGIN
    // ==========================================

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        string email = dto.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null ||
            !BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash))
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        if (!user.IsActive)
            throw new UnauthorizedAccessException(
                "Your account is inactive.");

        var roles = user.UserRoles
            .Select(ur => ur.Role.Name)
            .ToList();

        return await GenerateAuthResponseAsync(user, roles);
    }

    // ==========================================
    // GENERATE JWT + REFRESH TOKEN
    // ==========================================

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(
        User user,
        List<string> roles)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        string key = jwtSettings["Key"]
            ?? throw new InvalidOperationException(
                "JWT Key is missing.");

        string issuer = jwtSettings["Issuer"]
            ?? throw new InvalidOperationException(
                "JWT Issuer is missing.");

        string audience = jwtSettings["Audience"]
            ?? throw new InvalidOperationException(
                "JWT Audience is missing.");

        if (Encoding.UTF8.GetByteCount(key) < 32)
            throw new InvalidOperationException(
                "JWT Key must be at least 32 bytes.");

        if (!int.TryParse(
            jwtSettings["ExpiryInMinutes"],
            out int expiryMinutes) ||
            expiryMinutes <= 0)
        {
            throw new InvalidOperationException(
                "Invalid JWT expiry configuration.");
        }

        // Access Token Claims

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                user.FullName
            ),

            new Claim(
                ClaimTypes.Email,
                user.Email
            )
        };

        foreach (var role in roles.Distinct())
        {
            claims.Add(new Claim(
                ClaimTypes.Role,
                role
            ));
        }

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var now = DateTime.UtcNow;
        var expiration = now.AddMinutes(expiryMinutes);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: expiration,
            signingCredentials: credentials
        );

        string tokenString =
            new JwtSecurityTokenHandler().WriteToken(token);

        // Generate secure random refresh token

        string refreshTokenValue =
            Convert.ToBase64String(
                RandomNumberGenerator.GetBytes(64)
            );

        // Refresh token expiry (configurable)

        int refreshTokenDays = 7;

        if (!int.TryParse(
            _configuration["Jwt:RefreshTokenExpiryInDays"],
            out refreshTokenDays) ||
            refreshTokenDays <= 0)
        {
            refreshTokenDays = 7;
        }

        DateTime refreshExpiration =
            now.AddDays(refreshTokenDays);

        // Store SHA-256 hash, never store raw token

        var refreshToken = new RefreshToken
        {
            Token = HashRefreshToken(refreshTokenValue),
            UserId = user.Id,
            ExpiresAt = refreshExpiration,
            CreatedAt = now
        };

        _context.RefreshTokens.Add(refreshToken);

        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = tokenString,
            Expiration = expiration,

            RefreshToken = refreshTokenValue,
            RefreshTokenExpiration = refreshExpiration,

            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Roles = roles
        };
    }

    // ==========================================
    // HASH REFRESH TOKEN
    // ==========================================

    private static string HashRefreshToken(string refreshToken)
    {
        byte[] hash = SHA256.HashData(
            Encoding.UTF8.GetBytes(refreshToken)
        );

        return Convert.ToHexString(hash);
    }

    // ==========================================
    // REFRESH ACCESS TOKEN
    // ==========================================

    public async Task<AuthResponseDto> RefreshTokenAsync(
        RefreshTokenRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            throw new UnauthorizedAccessException(
                "Refresh token is required.");

        string hashedToken = HashRefreshToken(dto.RefreshToken);

        var existingToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(rt =>
                rt.Token == hashedToken);

        if (existingToken == null)
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");

        if (existingToken.IsRevoked)
            throw new UnauthorizedAccessException(
                "Refresh token has already been revoked.");

        if (existingToken.ExpiresAt <= DateTime.UtcNow)
            throw new UnauthorizedAccessException(
                "Refresh token has expired.");

        var user = existingToken.User;

        if (!user.IsActive)
            throw new UnauthorizedAccessException(
                "Your account is inactive.");

        // Revoke old refresh token

        existingToken.RevokedAt = DateTime.UtcNow;

        // Get current roles

        var roles = user.UserRoles
            .Select(ur => ur.Role.Name)
            .ToList();

        // Generate new Access Token + Refresh Token

        return await GenerateAuthResponseAsync(user, roles);
    }

    // ==========================================
    // LOGOUT / REVOKE REFRESH TOKEN
    // ==========================================

    public async Task RevokeRefreshTokenAsync(
        RefreshTokenRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            throw new UnauthorizedAccessException(
                "Refresh token is required.");

        string hashedToken = HashRefreshToken(dto.RefreshToken);

        var existingToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt =>
                rt.Token == hashedToken);

        if (existingToken == null)
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");

        if (existingToken.IsRevoked)
            return;

        existingToken.RevokedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    // ==========================================
    // CREATE EMPLOYEE (ADMIN)
    // ==========================================

    public async Task<UserResponseDto> CreateEmployeeAsync(
        CreateUserDto dto)
    {
        string email = dto.Email.Trim().ToLowerInvariant();

        bool emailExists = await _context.Users
            .AnyAsync(u => u.Email == email);

        if (emailExists)
            throw new InvalidOperationException(
                "Email already exists.");

        var employeeRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Employee");

        if (employeeRole == null)
            throw new InvalidOperationException(
                "Employee role not found.");

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.UserRoles.Add(new UserRole
        {
            RoleId = employeeRole.Id
        });

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = employeeRole.Name
        };
    }
}
