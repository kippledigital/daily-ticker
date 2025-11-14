/**
 * List available Claude models on your Anthropic account
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listClaudeModels() {
  console.log('🔍 Checking which Claude models are available on your account...\n');

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Common Claude model names to test
  const modelsToTest = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-sonnet-20240229',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
  ];

  console.log('Testing models with a simple API call...\n');

  for (const model of modelsToTest) {
    try {
      const message = await anthropic.messages.create({
        model: model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });

      console.log(`✅ ${model} - WORKS!`);
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`❌ ${model} - Not available (404)`);
      } else if (error.status === 403) {
        console.log(`⚠️  ${model} - Access denied (403) - upgrade tier needed`);
      } else {
        console.log(`❓ ${model} - Error: ${error.message}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('Use the first model that shows "✅ WORKS!" in your code');
  console.log('═══════════════════════════════════════════════════════════\n');
}

listClaudeModels()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
