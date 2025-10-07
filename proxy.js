
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const MAIN_SERVER_MCP_URL = 'http://localhost:3000/mcp';

// 1. Define the OpenAPI Specification for OpenWebUI
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'To-Do App Tools',
    version: '1.0.0',
    description: 'Tools for managing the to-do list application.'
  },
  paths: {
    '/createTask': {
      post: {
        summary: 'Create a new task',
        description: 'Creates a new task in the to-do list. Use this when a user wants to add, create, or be reminded of something.',
        operationId: 'createTask',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'The content of the task to be created.'
                  }
                },
                required: ['text']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    text: { type: 'string' },
                    completed: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

// 2. Serve the OpenAPI specification
app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// 3. Create the endpoint that OpenWebUI will call
app.post('/createTask', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'The "text" field is required.' });
  }

  // 4. Translate the simple REST request to an MCP request
  const mcpPayload = {
    context: {
      request_id: `req_${Date.now()}`,
      session_id: 'openwebui_session'
    },
    invocation: {
      tool_name: 'createTask',
      input: {
        text: text
      }
    }
  };

  try {
    // 5. Call the main MCP server
    console.log('Proxying request to main MCP server:', JSON.stringify(mcpPayload, null, 2));
    const mcpResponse = await axios.post(MAIN_SERVER_MCP_URL, mcpPayload);

    // 6. Translate the MCP response back to a simple REST response
    if (mcpResponse.data && mcpResponse.data.invocation_response?.structuredContent) {
      res.json(mcpResponse.data.invocation_response.structuredContent);
    } else {
      // Handle cases where the MCP response format is unexpected
      res.status(500).json({ error: 'Invalid response from MCP server', data: mcpResponse.data });
    }
  } catch (error) {
    console.error('Error proxying request to MCP server:', error.message);
    res.status(502).json({ error: 'Failed to communicate with the main server.' });
  }
});

// --- Start Proxy Server ---
const port = parseInt(process.env.PROXY_PORT || '4000');
app.listen(port, () => {
  console.log(`MCP-to-OpenAPI Proxy Server listening on http://localhost:${port}`);
  console.log(`OpenAPI spec available at http://localhost:${port}/openapi.json`);
}).on('error', error => {
  console.error('Proxy server error:', error);
  process.exit(1);
});
