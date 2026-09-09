FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SimplexPay.API/SimplexPay.API.csproj", "SimplexPay.API/"]
COPY ["SimplexPay.Application/SimplexPay.Application.csproj", "SimplexPay.Application/"]
COPY ["SimplexPay.Domain/SimplexPay.Domain.csproj", "SimplexPay.Domain/"]
COPY ["SimplexPay.Infrastructure/SimplexPay.Infrastructure.csproj", "SimplexPay.Infrastructure/"]
RUN dotnet restore "SimplexPay.API/SimplexPay.API.csproj"
COPY . .
WORKDIR "/src/SimplexPay.API"
RUN dotnet build "SimplexPay.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SimplexPay.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SimplexPay.API.dll"]
