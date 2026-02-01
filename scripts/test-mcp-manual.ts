#!/usr/bin/env npx ts-node
/**
 * Test MCP Server manually (without Gemini CLI)
 * Spawns the MCP server and sends JSON-RPC requests via stdin/stdout
 */

import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';

const MCP_SERVER_PATH = '../mcp-wrapper/dist/index.js';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

class MCPTestClient {
  private server: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests: Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }> = new Map();
  private rl: readline.Interface | null = null;

  async start(): Promise<void> {
    console.log('[test] Starting MCP server...');
    
    this.server = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: __dirname,
    });

    if (!this.server.stdout || !this.server.stdin) {
      throw new Error('Failed to get server stdio');
    }

    this.rl = readline.createInterface({
      input: this.server.stdout,
      crlfDelay: Infinity,
    });

    this.rl.on('line', (line) => {
      try {
        const response: JsonRpcResponse = JSON.parse(line);
        const pending = this.pendingRequests.get(response.id);
        if (pending) {
          this.pendingRequests.delete(response.id);
          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch (e) {
        // Not JSON, probably a log line
        console.log('[server]', line);
      }
    });

    this.server.on('error', (err) => {
      console.error('[test] Server error:', err);
    });

    this.server.on('exit', (code) => {
      console.log('[test] Server exited with code:', code);
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[test] MCP server started');
  }

  async sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.server?.stdin) {
      throw new Error('Server not started');
    }

    const id = ++this.requestId;
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.server!.stdin!.write(JSON.stringify(request) + '\n');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async listTools(): Promise<unknown> {
    return this.sendRequest('tools/list');
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.sendRequest('tools/call', { name, arguments: args });
  }

  stop(): void {
    if (this.rl) {
      this.rl.close();
    }
    if (this.server) {
      this.server.kill();
    }
    console.log('[test] Server stopped');
  }
}

async function runTests() {
  const client = new MCPTestClient();
  
  try {
    await client.start();

    // Test 1: List tools
    console.log('\n=== Test 1: List Tools ===');
    const tools = await client.listTools();
    console.log('Available tools:', JSON.stringify(tools, null, 2));

    // Test 2: Get stats
    console.log('\n=== Test 2: Get Stats ===');
    const stats = await client.callTool('get_stats', {});
    console.log('Stats:', JSON.stringify(stats, null, 2));

    // Test 3: Archive URL (validation test - should fail for non-whitelisted domain)
    console.log('\n=== Test 3: Validation Test (should fail) ===');
    const invalidResult = await client.callTool('archive_url', {
      url: 'https://malicious-site.com/bad',
      tags: ['test'],
    });
    console.log('Invalid URL result:', JSON.stringify(invalidResult, null, 2));

    // Test 4: Archive URL (valid domain - requires second-brain API running)
    console.log('\n=== Test 4: Valid URL Test ===');
    console.log('NOTE: This test requires second-brain API to be running on localhost:3100');
    console.log('Skipping actual archive test. To run manually:');
    console.log('  1. Start second-brain API: node batch-processor/src/api.js');
    console.log('  2. Run: npm run test:manual -- --url https://news.ycombinator.com/item?id=123');

    console.log('\n✅ All tests completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.stop();
  }
}

// Run tests
runTests();
