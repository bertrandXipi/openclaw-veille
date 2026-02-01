#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger.js';
import {
  archiveUrl,
  ArchiveUrlInputSchema,
  getRateLimiterStats,
  getMonitoringStatus,
} from './tools/archive-url.js';

const SERVER_NAME = 'openclaw-mcp-wrapper';
const SERVER_VERSION = '1.0.0';

/**
 * MCP Server for OpenClaw Agent
 * Provides secure archiving tool with validation, sanitization, and rate limiting
 */
class OpenClawMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    logger.info('OpenClaw MCP Server initialized', { 
      name: SERVER_NAME, 
      version: SERVER_VERSION 
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Listing tools');
      
      return {
        tools: [
          {
            name: 'archive_url',
            description: `Archive a URL to second-brain with NotebookLM integration.
            
This tool:
1. Validates the URL (whitelist check)
2. Enforces rate limits (30/day, 10/hour, 30s interval)
3. Fetches and sanitizes content
4. Adds to NotebookLM for AI analysis
5. Generates markdown file with AI summary
6. Commits to Git repository

Supported domains: Reddit, HackerNews, YouTube, GitHub, ArXiv, Medium, Substack, Twitter/X, LinkedIn, Dev.to, StackOverflow, TechCrunch, TheVerge, ArsTechnica, Wired.

Rate limits:
- Daily: 30 archives
- Hourly: 10 archives
- Minimum interval: 30 seconds

Returns: markdown file path, NotebookLM URL, and source ID.`,
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to archive (must be from whitelisted domain)',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Optional tags for categorization (max 10, alphanumeric only)',
                  default: [],
                },
                note: {
                  type: 'string',
                  description: 'Optional personal note (max 1000 chars)',
                  default: '',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'get_stats',
            description: 'Get current rate limiter stats and monitoring status',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.info('Tool call', { tool: name, args });

      try {
        if (name === 'archive_url') {
          // Validate input
          const input = ArchiveUrlInputSchema.parse(args);
          
          // Execute archive
          const result = await archiveUrl(input);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'get_stats') {
          const stats = getRateLimiterStats();
          const status = getMonitoringStatus();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ stats, status }, null, 2),
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        logger.error('Tool execution failed', { 
          tool: name, 
          error: error instanceof Error ? error.message : String(error) 
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    
    logger.info('Starting MCP server with stdio transport');
    
    await this.server.connect(transport);
    
    logger.info('MCP server connected and ready');
  }
}

// Start server
const server = new OpenClawMCPServer();
server.run().catch((error) => {
  logger.error('Server failed to start', { error: String(error) });
  process.exit(1);
});
