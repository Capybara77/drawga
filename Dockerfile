FROM node:current-alpine3.20 as node
WORKDIR ./frontend
COPY ./frontend .
RUN npm i
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:6.0 as build

WORKDIR /app
COPY ./backend/Drawga.csproj .
RUN dotnet restore "Drawga.csproj"
COPY ./backend .
RUN dotnet publish "Drawga.csproj" -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0

WORKDIR /app
COPY --from=node /frontend/dist ./wwwroot
COPY --from=build /publish ./

EXPOSE 80

ENTRYPOINT ["dotnet", "Drawga.dll"]