# OpenClaw MCP Wrapper

MCP (Model Context Protocol) wrapper for second-brain archiving with validation, sanitization, rate limiting, and NotebookLM integration.

## Features

- **URL Validation**: Whitelist-based domain filtering
- **Content Sanitization**: Detects and blocks prompt injection attempts
- **Rate Limiting**: 30 archives/day, 10/hour, 30s minimum interval
- **NotebookLM Integration**: AI-powered analysis and summaries
- **Git Integration**: Automatic commits to second-brain repository
- **Monitoring**: Tracks usage, errors, and costs with alerts
- **Structured Logging**: JSON logs for easy parsing

## Installation

```bash
cd mcp-wrapper
npm install
npm run build
```

## Configuration

The wrapper integrates with existing second-brain code. Ensure these environment variables are set:

```bash
# NotebookLM MCP server URL
NOTEBOOKLM_MCP_URL=http://127.0.0.1:8000/mcp

# Optional: specific notebook ID (otherwise uses monthly notebook)
NOTEBOOKLM_NOTEBOOK_ID=your-notebook-id
```

## Usage

### As MCP Server (for OpenClaw)

Start the server:

```bash
npm start
```

The server communicates via stdio (standard input/output) using the MCP protocol.

### Tool: `archive_url`

Archives a URL to second-brain with full processing pipeline.

**Input:**
```json
{
  "url": "https://news.ycombinator.com/item?id=123456",
  "tags": ["ai", "machine-learning"],
  "note": "Interesting discussion about transformers"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Successfully archived: Article Title",
  "markdown_path": "fiches/2026-02/2026-02-01-article-title.md",
  "notebook_url": "https://notebooklm.google.com/notebook/abc123",
  "source_id": "source-id-123"
}
```

### Tool: `get_stats`

Get current rate limiter and monitoring stats.

**Output:**
```json
{
  "stats": {
    "hourlyRequests": 5,
    "dailyRequests": 12,
    "hourlyRemaining": 5,
    "dailyRemaining": 18
  },
  "status": {
    "metrics": {
      "archiveCount": 12,
      "errorCount": 1,
      "totalCostUSD": 0.6,
      "lastArchiveTimestamp": 1706745600000
    },
    "alerts": [],
    "healthy": true
  }
}
```

## Whitelisted Domains

- reddit.com
- news.ycombinator.com
- youtube.com / youtu.be
- github.com
- arxiv.org
- medium.com
- substack.com
- twitter.com / x.com
- linkedin.com
- dev.to
- stackoverflow.com
- techcrunch.com
- theverge.com
- arstechnica.com
- wired.com

## Rate Limits

- **Daily**: 30 archives
- **Hourly**: 10 archives
- **Minimum interval**: 30 seconds between requests

## Monitoring Alerts

Alerts are triggered when:
- Daily archives exceed 50
- Daily errors exceed 10
- Daily cost exceeds $5 USD

## Security

### Validation
- URL must be from whitelisted domain
- Tags: max 10, alphanumeric + dash/underscore only
- Note: max 1000 characters

### Sanitization
- Content size limit: 50,000 characters
- Detects prompt injection patterns:
  - "ignore previous instructions"
  - "disregard all previous"
  - "forget everything"
  - "system prompt:"
  - etc.

## Development

### Run tests

```bash
npm test
```

### Watch mode

```bash
npm run dev
```

### Test with Gemini CLI

See `../scripts/test-mcp-gemini.sh` for integration testing.

## Architecture

```
┌─────────────────┐
│  OpenClaw Agent │
└────────┬────────┘
         │ MCP Protocol (stdio)
         ▼
┌─────────────────┐
│  MCP Wrapper    │
│  - Validation   │
│  - Sanitization │
│  - Rate Limiting│
│  - Monitoring   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  second-brain Integration       │
│  - fetch-content.js             │
│  - notebooklm-http.js           │
│  - markdown-generator-v2.js     │
│  - Git commit & push            │
└─────────────────────────────────┘
```

## Logs

All logs are JSON-structured:

```json
{
  "timestamp": "2026-02-01T10:30:00.000Z",
  "level": "info",
  "message": "Archive completed",
  "context": {
    "url": "https://example.com",
    "duration": 5432,
    "markdownPath": "fiches/2026-02/file.md"
  }
}
```

## Error Handling

Errors are logged and returned in the tool response:

```json
{
  "success": false,
  "message": "Archive failed",
  "error": "Rate limit exceeded: Daily limit of 30 requests exceeded"
}
```

## License

MIT
