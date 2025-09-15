# --- Stage 1: build .NET app ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /src
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/baaron4/GW2-Elite-Insights-Parser.git .
RUN dotnet publish GW2EIParserCLI/GW2EIParserCLI.csproj -c Release -o /out

# --- Stage 2: runtime with .NET + Node ---
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS runtime

RUN mkdir -p /root/.local/share /root/.config

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
    apt-get install -y nodejs

# --- Stage 3: app ---
FROM runtime AS app

# Copy .NET CLI
WORKDIR /app/GW2EIParser
COPY --from=builder /out .
COPY gw2ei.conf .

# Setup Node.js server
WORKDIR /app
RUN mkdir -p ./uploads
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]
