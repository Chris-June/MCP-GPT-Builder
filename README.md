# Role-Specific Context MCP Server

A Python-based Model Context Protocol (MCP) server that orchestrates AI agents with role-specific context management, built with FastAPI.

## Overview

This MCP Server acts as an intelligent AI orchestration layer designed to:

1. Manage AI agent roles, tone, and behavior
2. Provide contextually relevant memory and instructions
3. Integrate with OpenAI APIs to deliver personalized, role-specific outputs

## Features

- **Roles Management**: Create, store, and manage dynamic AI roles with specific expertise domains
- **Memory Handling**: Store and retrieve role-specific memories with TTL (Time-to-Live)
- **AI Processing**: Dynamically construct prompts with role instructions, tone profiles, and relevant memory
- **API Endpoints**: Clean RESTful API for role creation, memory management, and query processing
- **FastAPI Framework**: Modern, high-performance web framework with automatic documentation
- **React Client**: Modern React client with TypeScript, TailwindCSS, and shadcn/ui components
- **State Management**: Efficient state management with React Query for data fetching and caching
- **Responsive UI**: Mobile-friendly interface with dark/light theme support

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- OpenAI API key

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/role-specific-mcp.git
cd role-specific-mcp
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your OpenAI API key:

```bash
cp .env.example .env
```

**IMPORTANT**: Update the `.env` file with your actual OpenAI API key. The query processing functionality will not work without a valid API key.

```
# In your .env file
OPENAI_API_KEY=your_actual_api_key_here
```

## Usage

### Starting the Server

Run the backend server:


```bash
python server.py
```

This will start the server at http://localhost:8000 by default.

### API Documentation

Once the server is running, access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Starting the React Client

In a separate terminal, navigate to the client directory and start the development server:

```bash
cd client
npm install  # Only needed the first time
npm run dev
```

The React client will start at `http://localhost:5173` and automatically connect to the backend server.

## API Endpoints

### Health Check

```
GET /health
```

### Role Management

```
GET /api/v1/roles           # Get all roles
GET /api/v1/roles/{role_id} # Get a specific role
POST /api/v1/roles          # Create a new role
PATCH /api/v1/roles/{role_id} # Update a role
DELETE /api/v1/roles/{role_id} # Delete a role
```

### Query Processing

```
POST /api/v1/roles/process  # Process a query using a role
```

### Memory Management

```
POST /api/v1/memories       # Store a memory
GET /api/v1/memories/{role_id} # Get memories for a role
DELETE /api/v1/memories/{role_id} # Clear memories for a role
```

## Example API Usage

### Create a Custom Role

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/roles' \
  -H 'Content-Type: application/json' \
  -d '{
  "id": "tech-writer",
  "name": "Technical Writer",
  "description": "Specializes in clear, concise technical documentation",
  "instructions": "Create documentation that is accessible to both technical and non-technical audiences",
  "domains": ["technical-writing", "documentation", "tutorials"],
  "tone": "technical",
  "system_prompt": "You are an experienced technical writer with expertise in creating clear, concise documentation for complex systems."
}'
```

### Process a Query

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/roles/process' \
  -H 'Content-Type: application/json' \
  -d '{
  "role_id": "marketing-expert",
  "query": "How can I improve my social media engagement?",
  "custom_instructions": "Focus on B2B strategies"
}'
```

### Store a Memory

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/memories' \
  -H 'Content-Type: application/json' \
  -d '{
  "role_id": "marketing-expert",
  "content": "The user prefers Instagram over TikTok for their business",
  "type": "user",
  "importance": "medium"
}'
```

## Docker Deployment

Build and run the container:

```bash
docker build -t role-specific-mcp .
docker run -p 8000:8000 --env-file .env role-specific-mcp
```

## Future Roadmap

- Vector database integration (ChromaDB, Weaviate) for semantic memory retrieval
- Real-time context switching based on triggers
- Multi-modal context support
- Support for LangGraph agents and RAG pipelines
- Enhanced authentication and security features

## License

MIT
