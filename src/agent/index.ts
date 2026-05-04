import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { retrieveRelevantSchemas } from '../rag/index.js';
import { executeQuery } from '../db/index.js';
import dotenv from 'dotenv';

dotenv.config();

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    temperature: 0, // We want deterministic, accurate SQL
  });
};

const SQL_GENERATION_TEMPLATE = `
You are an expert MySQL database developer. Your job is to translate a user's natural language question into a valid, optimized MySQL query.

Here is the schema for the relevant tables in the database:
{schema}

User Question: {question}

Instructions:
1. Write a valid MySQL query to answer the user's question.
2. Only return the raw SQL query. Do not wrap it in markdown block quotes (e.g., \`\`\`sql ... \`\`\`).
3. Ensure you only use the columns and tables provided in the schema.
4. If you are unsure or the question cannot be answered with the given schema, output exactly: "I cannot answer this question based on the database schema."
`;

const prompt = PromptTemplate.fromTemplate(SQL_GENERATION_TEMPLATE);

export interface AgentResult {
  query: string;
  sql?: string;
  data?: any[];
  error?: string;
  message?: string;
}

/**
 * Runs the complete DB agent pipeline for a given user question.
 */
export async function runDatabaseAgent(question: string): Promise<AgentResult> {
  try {
    // 1. Retrieve relevant schema using RAG
    const relevantDocs = await retrieveRelevantSchemas(question, 4);
    const schemaContext = relevantDocs.map(doc => doc.pageContent).join('\n\n');

    if (!schemaContext) {
      return { query: question, message: 'No relevant schema found to answer your question.' };
    }

    // 2. Generate SQL using the LLM
    const model = getModel();
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    let generatedSql = await chain.invoke({
      schema: schemaContext,
      question: question
    });

    // Clean up SQL just in case the model adds markdown
    generatedSql = generatedSql.replace(/^```sql\n?/, '').replace(/```$/, '').trim();

    if (generatedSql === "I cannot answer this question based on the database schema.") {
      return { query: question, message: generatedSql };
    }

    // 3. Execute the SQL against the DB
    try {
      const results = await executeQuery(generatedSql);
      return {
        query: question,
        sql: generatedSql,
        data: results
      };
    } catch (dbError: any) {
      // If execution fails, we could potentially retry by feeding the error back to the LLM.
      // For now, we return the error.
      return {
        query: question,
        sql: generatedSql,
        error: `Failed to execute SQL: ${dbError.message}`
      };
    }

  } catch (err: any) {
    console.error('Error in agent pipeline:', err);
    return {
      query: question,
      error: `Agent encountered an error: ${err.message}`
    };
  }
}
