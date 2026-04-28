using Microsoft.AspNetCore.Mvc;
using SpotReservation.Application.Features.ReservationPages;

namespace SpotReservation.Api.Endpoints;

public static class ReservationPagesEndpoints
{
    public static IEndpointRouteBuilder MapReservationPages(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("api/reservation-pages").WithTags("ReservationPages");

        group.MapGet("/{id}", async (string id, IReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.GetAsync(id, ct)))
            .AllowAnonymous()
            .Produces<ReservationPageDto>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async ([FromBody] CreateReservationPageRequest request, IReservationPageService pages, CancellationToken ct) =>
        {
            var created = await pages.CreateAsync(request, ct);
            return Results.Created($"/api/reservation-pages/{created.Id}", created);
        })
        .RequireAuthorization(pb => pb.RequireRole("Admin"))
        .Produces<ReservationPageDto>(StatusCodes.Status201Created);

        group.MapPut("/{id}", async (string id, [FromBody] UpdateReservationPageRequest request, IReservationPageService pages, CancellationToken ct) =>
            Results.Ok(await pages.UpdateAsync(id, request, ct)))
            .RequireAuthorization(pb => pb.RequireRole("Admin"))
            .Produces<ReservationPageDto>()
            .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
