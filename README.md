## GW2 Elite Insights Node.js Container

## Project Description

This project is a Node.js server that enables the use of [Guild Wars 2 Elite Insights Parser](https://github.com/baaron4/GW2-Elite-Insights-Parser) outside the .NET ecosystem. The main goal is to provide the ability to host Elite Insights as a web service in a Docker container on any platform.

### Key Benefits

- 🐳 **Docker containerization** - easy deployment on any platform
- 🌐 **Web API** - RESTful interface for integration with other systems
- 📤 **File upload** - support for multiple `.evtc/.zevtc` file uploads
- ⚡ **Asynchronous processing** - background file processing without blocking
- 🎨 **Web interface** - convenient user interface for file uploads
- 🧹 **Automatic cleanup** - management of temporary files and artifacts

## Architecture

The project uses multi-stage Docker build:
1. **Build .NET application** - clone and compile GW2 Elite Insights Parser
2. **Runtime environment** - .NET runtime + Node.js
3. **Final image** - Node.js server + compiled .NET CLI (you can fork this project and change this step to use your own server platform, e.g. Python, Go, etc.)

## Server Capabilities

### HTTP API

#### `POST /api/parse`
Upload and process Guild Wars 2 combat log files provided by arcdps

**Parameters:**
- `files` (multipart/form-data) - one or more `.evtc/.zevtc` files

**Response:**
```json
{
  "message": "Files received. Processing in background.",
  "files": [
    {
      "filename": "log.evtc",
      "readFileUrl": "/api/read?filename=1234567890"
    }
  ]
}
```

#### `GET /api/read?filename={name}`
Get processing results in JSON format.

**Parameters:**
- `filename` (query) - filename without the extension returned by `/api/parse` without the extension

**Response:** JSON data with combat analysis results

### Web Interface

- Simple web interface at `http://localhost:3000` for uploading files, and accessing parsed JSONs

### Processing Features

- **Combat log parsing** - full analysis of `.evtc/.zevtc` files
- **Background processing** - non-blocking processing of multiple files
- **Artifact management** - automatic cleanup of temporary files
- **Error handling** - detailed logging and error handling

## Installation and Setup

### Prerequisites

- Docker

### Quick Start

1. **Clone the repository:**
```bash
git clone git@github.com:likerRr/gw2-elite-insights-node.git
cd gw2-elite-insights-node
```

2. **Run in development mode:**
```bash
npm run dev
```

3. **Run in production mode:**
```bash
npm run prod
```

4. **Stop services:**
```bash
# For development
npm run dev:down

# For production
npm run prod:down
```

### Available Commands

| Command | Description                                                   |
|---------|---------------------------------------------------------------|
| `npm run dev` | Run in development mode with rebuild                          |
| `npm run dev:down` | Stop dev environment with volume removal                      |
| `npm run prod` | Run in production mode (detached)                             |
| `npm run prod:down` | Stop production environment                                   |
| `npm run rebuild:cli` | Rebuild .NET CLI without cache |

* The .NET CLI tool is built only once during the initial run of `npm run dev` or `npm run prod`. To rebuild it, use `npm run rebuild:cli`.
* In development mode, changes in the `src` directory automatically restart the server.
* Temporary files are stored in the `uploads` directory, which is created automatically (dev mode).

### Configuration

#### Environment Variables

- `PORT` - server port (default: 3000)
- `NODE_ENV` - Node.js environment

#### Configuration Files

- `gw2ei.conf` - Elite Insights Parser [configuration](https://github.com/baaron4/GW2-Elite-Insights-Parser?tab=readme-ov-file#settings)
- `docker-compose.yml` - main Docker configuration
- `docker-compose.override.yml` - development overrides

## Usage

### Via Web Interface

1. Open http://localhost:3000
2. Upload `.evtc` or `.zevtc` files
3. Wait for processing (usually about a second on a modern system)
4. Get JSON results

### Via API

```bash
# Upload file
curl -X POST -F "files=@combat.evtc" http://localhost:3000/api/parse

# Get results
curl "http://localhost:3000/api/read?filename=%filename%"

# replace %filename% with the name (without the extension) returned by the /api/parse endpoint
```

### Integration with Other Systems

The server API can be easily integrated with:
- Discord bots for raid analysis
- Guild web applications
- Analytics and statistics systems
- CI/CD pipelines for automated testing

## Project Structure

```
├── src/
│   ├── server.js          # Main Express server
│   ├── config.js          # Application configuration
│   └── lib/
│       └── cleanupArtifacts.js  # File cleanup utilities
├── public/
│   └── index.html         # Web interface
├── uploads/               # Temporary files (created automatically)
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Services configuration
└── gw2ei.conf            # Elite Insights configuration
```

## Performance and Scaling

- Server processes files asynchronously in the background
- Automatic cleanup of temporary files prevents disk overflow
- Possibility of horizontal scaling through load balancer
- Support for processing multiple files simultaneously

### Concurrency and Advanced Flow Control

This project intentionally does not implement advanced concurrency features such as:
- Job queuing and prioritization
- Rate limiting and throttling
- Concurrent processing limits
- Complex workflow orchestration
- Retry mechanisms with backoff strategies

For production environments requiring these features, it's strictly recommended using dedicated cloud platforms like:
- **[Inngest](https://www.inngest.com/docs/guides/flow-control)** - for event-driven workflows, job queuing, and flow control
- Other queue management services (Redis Queue, Bull, AWS SQS, etc.)
- API gateways for rate limiting and request management

This keeps the project simple and focused on its core functionality while allowing integration with more sophisticated infrastructure when needed.

## License

The project is distributed under the license specified in the LICENSE file.
