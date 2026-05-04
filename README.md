# DBAgent 🤖🗄️

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**DBAgent** is an intelligent, AI-powered database assistant built to translate natural language questions into executable SQL queries. 

By leveraging **Retrieval-Augmented Generation (RAG)**, DBAgent efficiently indexes your database schema locally and only feeds the necessary table definitions to the LLM (Google Gemini). This prevents token overflow, guarantees high precision, and ensures the AI understands your unique data relationships without sending your entire database structure across the wire at once.

---

## ✨ Key Features
- 🗣️ **Natural Language to SQL**: Ask questions in plain English and receive accurate data back.
- 🧠 **Smart Schema Indexing (RAG)**: Embeds table and column schemas locally using `hnswlib-node` and `gemini-embedding-2`, making it token-efficient and blazing fast.
- ⚡ **Google Gemini Powered**: Utilizes `gemini-2.5-flash` for high-quality, deterministic SQL generation.
- 🔌 **Dual Interfaces**: Interact with the agent via a robust Command Line Interface (CLI) or integrate it into your frontend via the Express.js REST API.
- 🔒 **Secure Execution**: Safe SQL query execution wrapper specifically built for MySQL using `mysql2`.

---

## 🛠️ Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MySQL Server](https://www.mysql.com/) (running locally or remotely)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jpjitendrapal/dbagent.git
   cd dbagent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   Copy the example environment file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your `GEMINI_API_KEY` and MySQL credentials:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```

---

## 💻 Usage

Before asking questions, you must index your database schema. This step reads your database structure and builds the local vector store.

### 1. Index the Database
Run this command once (or whenever your database schema changes):
```bash
npm run cli -- index
```

### 2. Ask Questions (CLI)
You can directly interact with the agent via the terminal:
```bash
npm run cli -- ask "How many customers do we have in total?"
npm run cli -- ask "Who are the top 5 highest paying customers?"
```

### 3. REST API Server
If you want to connect a frontend or external service, start the Express server:
```bash
npm run start:api
```
*The server runs on `http://localhost:3000` by default.*

**Test the API using cURL:**
```bash
curl -X POST http://localhost:3000/api/ask \
     -H "Content-Type: application/json" \
     -d '{"question": "How many customers are there?"}'
```

---

## 📂 Project Structure

```text
dbagent/
├── src/
│   ├── agent/       # Core LangChain logic and SQL generation prompts
│   ├── api/         # Express.js REST API endpoints
│   ├── cli/         # Commander.js CLI application
│   ├── db/          # MySQL connection pool and schema extraction
│   └── rag/         # Vector DB indexing and retrieval logic (HNSWLib)
├── .env.example     # Environment variables template
├── package.json     # Project dependencies & scripts
└── tsconfig.json    # TypeScript configuration
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/jpjitendrapal/dbagent/issues). If you want to add support for PostgreSQL, MongoDB, or other LLMs (like OpenAI), PRs are heavily encouraged.

## 📝 License
This project is licensed under the **ISC License**.
