
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace TaskManagement.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    static CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", "Testing");

        Environment.SetEnvironmentVariable(
            "Jwt__Key",
            "TestingOnlySecretKeyForIntegrationTests123456789");

        Environment.SetEnvironmentVariable(
            "Jwt__Issuer",
            "TaskManagement.Tests");

        Environment.SetEnvironmentVariable(
            "Jwt__Audience",
            "TaskManagement.Tests");

        Environment.SetEnvironmentVariable(
            "ConnectionStrings__conStr",
            "Server=(localdb)\\MSSQLLocalDB;Database=TaskManagementTestDb;Trusted_Connection=True;");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme =
                        TestAuthHandler.SchemeName;

                    options.DefaultChallengeScheme =
                        TestAuthHandler.SchemeName;

                    options.DefaultScheme =
                        TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.SchemeName,
                    options => { });
        });
    }
}
