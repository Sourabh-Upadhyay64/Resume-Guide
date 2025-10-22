import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.5-flash'; // Stable and widely available model

/**
 * Generate text using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Generation config (temperature, maxOutputTokens, etc.)
 * @returns {Promise<{text: string, duration: number}>}
 */
async function generate(prompt, options = {}) {
  // Initialize at runtime to ensure dotenv has loaded
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[geminiClient] API Key loaded: MISSING');
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
  }

  console.log('[geminiClient] API Key loaded:', apiKey ? 'PRESENT' : 'MISSING');
  console.log('[geminiClient] Using model:', MODEL_NAME);

  const start = Date.now();
  try {
    // Initialize the Gemini client at runtime
    const genAI = new GoogleGenerativeAI(apiKey);
    
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
