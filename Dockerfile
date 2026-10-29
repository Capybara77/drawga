FROM node:24-alpine AS node
WORKDIR /frontend
RUN npm i -g pnpm@12.16.1
COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./frontend .
RUN pnpm build-only

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build

WORKDIR /app
COPY ./backend/Drawga.csproj .
RUN dotnet restore "Drawga.csproj"
COPY ./backend .
RUN dotnet publish "Drawga.csproj" -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=node /frontend/dist ./dist
COPY --from=build /publish ./

# база и сохранения досок живут в volume /app/data и /app/saves
ENV ConnectionStrings__Default="Data Source=/app/data/data.db"
RUN mkdir -p /app/data /app/saves

EXPOSE 8080

ENTRYPOINT ["dotnet", "Drawga.dll"]
