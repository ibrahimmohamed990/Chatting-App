using ChatAPI.Hubs;
using ChatAPI.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<ChatService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        p => p.WithOrigins("http://localhost:4200")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials());
});

builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseCors(x => x.AllowCredentials()
//                  .AllowAnyHeader()
//                  .AllowAnyMethod()
//                  .WithOrigins("http://localhost:4200"));

app.UseCors("CorsPolicy");
app.UseHttpsRedirection();

app.UseAuthorization();
app.UseDefaultFiles();
app.UseStaticFiles();   

app.MapControllers();

app.MapHub<ChatHub>("/hubs/chat");
app.MapFallbackToController("Index", "Fallback");

app.Run();
