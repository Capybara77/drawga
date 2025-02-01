FROM mcr.microsoft.com/dotnet/sdk:6.0 as build

WORKDIR /app
COPY Drawga.csproj .
RUN dotnet restore "Drawga.csproj"
COPY . .
RUN dotnet publish "Drawga.csproj" -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0

WORKDIR /app
COPY --from=build /publish ./

EXPOSE 5600

ENTRYPOINT ["dotnet", "Drawga.dll"]