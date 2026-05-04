import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';
import { extractDatabaseSchema, type TableSchema } from '../db/index.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const VECTOR_STORE_PATH = process.env.VECTOR_STORE_PATH || './vector_store';

/**
 * Initializes the embeddings model using Google GenAI.
 */
function getEmbeddings() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-embedding-2', // Valid embedding model from ListModels
  });
}

/**
 * Converts the DB Schema array into an array of LangChain Documents.
 * Each document represents a single table and its columns.
 */
function formatSchemaToDocuments(schemas: TableSchema[]): Document[] {
  return schemas.map(schema => {
    // We create a rich description of the table for the embedding.
    const columnDescriptions = schema.columns
      .map(col => `- ${col.columnName} (${col.dataType})`)
      .join('\n');
      
    const pageContent = `Table Name: ${schema.tableName}\nColumns:\n${columnDescriptions}`;
    
    return new Document({
      pageContent,
      metadata: { tableName: schema.tableName },
    });
  });
}

/**
 * Creates or updates the vector store with the latest database schema.
 */
export async function indexDatabaseSchema(): Promise<void> {
  console.log('Extracting database schema...');
  const schemas = await extractDatabaseSchema();
  
  if (schemas.length === 0) {
    console.warn('No tables found in the database.');
    return;
  }

  console.log(`Extracted schema for ${schemas.length} tables. Formating into documents...`);
  const documents = formatSchemaToDocuments(schemas);

  console.log('Generating embeddings and indexing into Vector Store...');
  const vectorStore = await HNSWLib.fromDocuments(documents, getEmbeddings());
  
  // Ensure the directory exists
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    fs.mkdirSync(VECTOR_STORE_PATH, { recursive: true });
  }

  await vectorStore.save(VECTOR_STORE_PATH);
  console.log(`Successfully indexed schema and saved vector store to ${VECTOR_STORE_PATH}`);
}

/**
 * Loads the existing vector store from disk.
 */
export async function loadVectorStore(): Promise<HNSWLib> {
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    throw new Error(`Vector store not found at ${VECTOR_STORE_PATH}. Please run the indexer first.`);
  }
  return await HNSWLib.load(VECTOR_STORE_PATH, getEmbeddings());
}

/**
 * Given a user's natural language question, retrieve the most relevant table schemas.
 */
export async function retrieveRelevantSchemas(query: string, k: number = 3): Promise<Document[]> {
  const vectorStore = await loadVectorStore();
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}
