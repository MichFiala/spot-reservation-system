using Microsoft.AspNetCore.Mvc;
using SpotReservation.Application.Common.Exceptions;
using SpotReservation.Domain.Exceptions;

namespace SpotReservation.Api.Middleware;

/// <summary>
/// Translates Application/Domain exceptions into RFC 7807 problem responses.
/// Anything unexpected is logged and returned as a generic 500.
/// </summary>
internal sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Validation failed", ex.Message, ex.Errors);
        }
        catch (NotFoundException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status404NotFound, "Resource not found", ex.Message);
        }
        catch (ConflictException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status409Conflict, "Conflict", ex.Message);
        }
        catch (UnauthorizedException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, "Unauthorized", ex.Message);
        }
        catch (DomainException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Domain rule violated", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, "Server error", "An unexpected error occurred.");
        }
    }

    private static Task WriteProblemAsync(
        HttpContext context,
        int status,
        string title,
        string detail,
        IReadOnlyDictionary<string, string[]>? errors = null)
    {
        if (context.Response.HasStarted)
        {
            return Task.CompletedTask;
        }

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";

        if (errors is { Count: > 0 })
        {
            var validation = new ValidationProblemDetails(errors.ToDictionary(k => k.Key, v => v.Value))
            {
                Status = status,
                Title = title,
                Detail = detail,
                Instance = context.Request.Path,
            };
            return context.Response.WriteAsJsonAsync(validation);
        }

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
        };
        return context.Response.WriteAsJsonAsync(problem);
    }
}
