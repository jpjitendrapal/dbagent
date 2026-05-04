#!/usr/bin/env node

import { Command } from 'commander';
import { indexDatabaseSchema } from '../rag/index.js';
import { runDatabaseAgent } from '../agent/index.js';

const program = new Command();

program
  .name('dbagent')
  .description('Intelligent Database Agent powered by LLMs')
  .version('1.0.0');

program
  .command('index')
  .description('Extracts the database schema and builds the local vector store for RAG')
  .action(async () => {
    try {
      console.log('Starting schema indexing process...');
      await indexDatabaseSchema();
      console.log('Indexing complete! You can now run the `ask` command.');
      process.exit(0);
    } catch (error) {
      console.error('Failed to index schema:', error);
      process.exit(1);
    }
  });

program
  .command('ask')
  .description('Ask a natural language question to your database')
  .argument('<question>', 'The question you want to ask in plain English')
  .action(async (question: string) => {
    console.log(`\nQuestion: "${question}"`);
    console.log('Generating SQL and fetching data...\n');
    
    try {
      const result = await runDatabaseAgent(question);
      
      if (result.error) {
        console.error('❌ Error:', result.error);
        if (result.sql) {
          console.log('\nGenerated SQL was:');
          console.log(result.sql);
        }
      } else if (result.message) {
        console.log('⚠️ Agent Message:', result.message);
      } else {
        console.log('✅ Generated SQL:');
        console.log(result.sql);
        console.log('\n📊 Results:');
        
        if (result.data && result.data.length > 0) {
          console.table(result.data);
        } else {
          console.log('No rows returned.');
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    } finally {
      process.exit(0);
    }
  });

program.parse(process.argv);
