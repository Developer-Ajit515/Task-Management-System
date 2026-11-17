
using System.Net;
using Xunit;

namespace TaskManagement.Tests;

public class TaskControllerIntegrationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TaskControllerIntegrationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private void SetTestUser(string userId, string role)
    {
        _client.DefaultRequestHeaders.Remove("X-Test-UserId");
        _client.DefaultRequestHeaders.Remove("X-Test-Role");

        _client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
        _client.DefaultRequestHeaders.Add("X-Test-Role", role);
    }

    [Fact]
    public async Task GetAllTasks_WithoutAuthentication_Returns401()
    {
        var response = await _client.GetAsync("/api/Tasks");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAllTasks_EmployeeRole_Returns403()
    {
        SetTestUser("2", "Employee");

        var response = await _client.GetAsync("/api/Tasks");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetMyTasks_AdminRole_Returns403()
    {
        SetTestUser("1", "Admin");

        var response = await _client.GetAsync("/api/Tasks/my-tasks");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetAllTasks_InvalidPageNumber_Returns400()
    {
        SetTestUser("1", "Admin");

        var response = await _client.GetAsync(
            "/api/Tasks?pageNumber=0");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAllTasks_InvalidPageSize_Returns400()
    {
        SetTestUser("1", "Admin");

        var response = await _client.GetAsync(
            "/api/Tasks?pageSize=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetTask_InvalidId_Returns400()
    {
        SetTestUser("1", "Admin");

        var response = await _client.GetAsync("/api/Tasks/0");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
