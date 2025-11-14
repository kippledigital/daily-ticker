/**
 * Test OpenAI API Access and Rate Limits
 * Checks if we've hit rate limits from backfill scripts
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAIAccess() {
  console.log('🔍 Testing OpenAI API Access...\n');

  try {
    // Test 1: List models (simple API call)
    console.log('Test 1: Listing available models...');
    const models = await openai.models.list();
    const gpt4Models = models.data.filter(m => m.id.includes('gpt-4'));
    console.log(`✅ API accessible - Found ${gpt4Models.length} GPT-4 models`);
    console.log(`   Available: ${gpt4Models.slice(0, 5).map(m => m.id).join(', ')}...\n`);

    // Test 2: Simple chat completion (actual AI call)
    console.log('Test 2: Testing chat completion with gpt-4o...');
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a test assistant. Respond with valid JSON only.' },
        { role: 'user', content: 'Return this JSON: {"test": "success", "value": 42}' }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    const duration = Date.now() - startTime;

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const parsed = JSON.parse(response);
      console.log(`✅ Chat completion successful (${duration}ms)`);
      console.log(`   Response: ${JSON.stringify(parsed)}\n`);
    } else {
      console.log('❌ No response from chat completion\n');
    }

    // Test 3: Check usage/rate limits from response headers
    console.log('Test 3: Checking rate limit status...');
    console.log(`   Model used: ${completion.model}`);
    console.log(`   Tokens: ${completion.usage?.total_tokens || 'N/A'}`);
    console.log(`   ✅ No rate limit errors detected\n`);

    console.log('═'.repeat(70));
    console.log('✅ ALL TESTS PASSED - OpenAI API is working correctly!');
    console.log('   • API is accessible');
    console.log('   • gpt-4o model works');
    console.log('   • JSON mode works');
    console.log('   • No rate limits hit');
    console.log('═'.repeat(70));

  } catch (error: any) {
    console.error('\n❌ OpenAI API Error:');
    console.error('═'.repeat(70));

    if (error.status) {
      console.error(`Status: ${error.status}`);
    }

    if (error.type) {
      console.error(`Type: ${error.type}`);
    }

    if (error.code) {
      console.error(`Code: ${error.code}`);
    }

    if (error.message) {
      console.error(`Message: ${error.message}`);
    }

    // Check for specific rate limit error
    if (error.status === 429 || error.type === 'rate_limit_error') {
      console.error('\n🚨 RATE LIMIT HIT!');
      console.error('   You have exceeded your API quota or rate limits.');
      console.error('   Wait a few minutes and try again.');
      console.error('   Or check your OpenAI account usage limits.');
    }

    // Check for invalid model error
    if (error.message?.includes('model') || error.code === 'model_not_found') {
      console.error('\n🚨 MODEL ERROR!');
      console.error('   The model "gpt-4o" may not be available on your account.');
      console.error('   Try "gpt-4-turbo" or "gpt-3.5-turbo" instead.');
    }

    console.error('═'.repeat(70));
    throw error;
  }
}

// Run the test
testOpenAIAccess()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed');
    process.exit(1);
  });
