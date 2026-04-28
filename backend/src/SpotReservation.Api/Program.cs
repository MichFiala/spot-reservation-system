using Microsoft.AspNetCore.Http.Json;
using Microsoft.OpenApi.Models;
using NetTopologySuite.IO.Converters;
using SpotReservation.Api.Endpoints;
using SpotReservation.Api.Middleware;
using SpotReservation.Api.Services;
using SpotReservation.Application;
using SpotReservation.Application.Abstractions;
using SpotReservation.Infrastructure;
using SpotReservation.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtBearerAuth(builder.Configuration);
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(origin =>
            {
                var host = new Uri(origin).Host;
                return host == "localhost" || host.EndsWith(".localhost");
            })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new GeoJsonConverterFactory());
});


var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

await DatabaseSeeder.SeedAsync(app.Services);

app.MapAuth();
app.MapSpots();
app.MapReservations();
app.MapReservationPages();

app.Run();
