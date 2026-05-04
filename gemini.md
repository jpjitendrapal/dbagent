# Database Agent (dbagent) Context & Guidelines

## Project Purpose
`dbagent` is an intelligent database assistant built to translate natural language questions into executable database queries. It uses a Retrieval-Augmented Generation (RAG) architecture to search database schemas, generate optimized SQL queries, execute them, and return formatted results to the user.

## Architecture
- **Language**: TypeScript / Node.js
- **LLM Engine**: Google Gemini API (Configurable via LangChain.js, abstract enough to easily swap with OpenAI or others).
- **RAG & Vector Store**: `hnswlib-node` (local, in-memory/file-based vector DB) via LangChain.js to index database schemas efficiently without hitting context limits on large databases.
- **Interfaces**:
  - **CLI**: Interactive command-line interface.
  - **REST API**: Express.js server exposing the agent endpoints.
- **Database Support**: MySQL (using `mysql2`). Must be modular so other SQL/NoSQL connectors can be added later.

## Core Flow
1. **Schema Indexing**: Extract tables and column definitions from the DB and store them as embeddings in the local vector DB.
2. **Query Processing**: User asks a plain English question.
3. **Retrieval**: Agent queries the vector DB to fetch only the relevant table schemas.
4. **SQL Generation**: Prompt the LLM with the user's question and relevant schemas to generate a valid SQL query.
5. **Execution & Validation**: Execute the query safely. Validate the output.
6. **Formatting**: Return results as structured data (Table/CSV).

## AI Assistant Guidelines
1. **Modularity**: Keep the code modular. Separate DB connections, RAG logic, Agent core, CLI, and API into their respective folders.
2. **Typescript Best Practices**: Use strict typing and define interfaces for agent inputs, outputs, and database schemas.
3. **Configuration**: Hardcode NO secrets. All DB credentials, LLM API keys, and environment settings must come from the `.env` file using `dotenv`.
4. **Environment agnostic**: Ensure it works efficiently on local environments. Use embedded vector DBs (`hnswlib-node`) so no heavy infrastructure setup is required for the RAG part.
