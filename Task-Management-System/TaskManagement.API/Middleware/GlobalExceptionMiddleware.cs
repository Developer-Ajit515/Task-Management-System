
using System.Net;
using System.Text.Json;
using TaskManagement.Application.Exceptions;

namespace TaskManagement.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An unexpected error occurred. TraceId: {TraceId}",
                context.TraceIdentifier
            );

            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        if (context.Response.HasStarted)
        {
            throw exception;
        }

        context.Response.Clear();

        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            ForbiddenException ex =>
                (HttpStatusCode.Forbidden, ex.Message),

            UnauthorizedAccessException ex =>
                (HttpStatusCode.Unauthorized, ex.Message),

            KeyNotFoundException ex =>
                (HttpStatusCode.NotFound, ex.Message),

            InvalidOperationException ex =>
                (HttpStatusCode.BadRequest, ex.Message),

            ArgumentException ex =>
                (HttpStatusCode.BadRequest, ex.Message),

            _ =>
                (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            statusCode = (int)statusCode,
            message = message,
            traceId = context.TraceIdentifier,
            timestamp = DateTime.UtcNow
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, jsonOptions)
        );
    }
}
