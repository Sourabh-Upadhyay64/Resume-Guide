import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  GEMINI_API_KEY is not set in environment. Gemini calls will fail until it is provided.');
  console.warn('⚠️  Please create a .env file in backend/ with: GEMINI_API_KEY=your_key_here');
}

// Initialize the Gemini client with the correct SDK usage
const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key-for-init');

const MODEL_NAME = 'gemini-1.5-pro';

/**
 * Generate text using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Generation config (temperature, maxOutputTokens, etc.)
 * @returns {Promise<{text: string, duration: number}>}
 */
async function generate(prompt, options = {}) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
  }

  const start = Date.now();
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Configure generation parameters
    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topP: options.topP || 0.95,
      topK: options.topK || 40,
    };

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();
    const duration = Date.now() - start;

    console.log(`✓ Gemini API call completed in ${duration}ms`);
    return { text, duration };
  } catch (err) {
    const duration = Date.now() - start;
    console.error('✗ Gemini API error:', err.message);
    throw { error: err, duration, message: err.message };
  }
}

export { generate };
