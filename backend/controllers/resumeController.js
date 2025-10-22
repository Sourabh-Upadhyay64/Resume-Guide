import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

export const scanResume = async (req, res) => {
  console.log('[resume.scan] Start');
  const startTime = Date.now();
  
  // Get API key at runtime, not at module load time
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[resume.scan] ❌ GEMINI_API_KEY not found in environment');
    console.error('[resume.scan] Available env vars:', Object.keys(process.env).join(', '));
    return res.status(500).json({ 
      error: 'Server configuration error: API key missing',
      details: 'GEMINI_API_KEY environment variable is not set on the server' 
    });
  }
  
  console.log('[resume.scan] ✓ API Key found:', apiKey.substring(0, 10) + '...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    if (!req.file) {
      console.error('[resume.scan] ❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('[resume.scan] File:', req.file.originalname, 'Type:', req.file.mimetype, 'Size:', req.file.size);

    let resumeText = '';
    
    // For DOCX files, extract text (Gemini doesn't support DOCX directly)
    if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        req.file.originalname.endsWith('.docx')) {
      console.log('[resume.scan] Extracting text from DOCX...');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
    } else {
      // For PDFs, convert buffer to base64
      resumeText = req.file.buffer.toString('base64');
    }

    const prompt = `You are an ATS (Applicant Tracking System) evaluator. Analyze this resume using CONSISTENT scoring criteria.

EVALUATION CRITERIA (Total 100 points):
1. Structure & Format (20 points):
   - Clear sections (Contact, Summary, Experience, Education, Skills)
   - Consistent formatting
   - Proper spacing and organization
   - Professional layout

2. Content Quality (25 points):
   - Quantifiable achievements with metrics
   - Action verbs usage
   - Relevant keywords for the role
   - Clear and concise descriptions

3. Professional Experience (25 points):
   - Recent and relevant work history
   - Clear job titles and dates
   - Measurable accomplishments
   - Career progression

4. Skills & Keywords (20 points):
   - Technical skills listed
   - Industry-relevant keywords
   - Tools and technologies mentioned
   - Certifications if applicable

5. Education & Credentials (10 points):
   - Degree information
   - Relevant certifications
   - Additional training

SCORING GUIDELINES:
- 90-100: Excellent - ATS-optimized, highly competitive
- 75-89: Good - Strong resume, minor improvements needed
- 60-74: Fair - Needs improvement in key areas
- Below 60: Poor - Major revisions required

Return ONLY valid JSON in this EXACT format (no markdown, no explanations):
{
  "atsScore": (number 0-100, calculate based on above criteria),
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3", "specific improvement 4", "specific improvement 5"],
  "summary": "2-3 sentence professional summary of the candidate's profile and overall resume quality"
}

Be CONSISTENT - same resume should get same score. Base score on OBJECTIVE criteria above.`;

    console.log('[resume.scan] Sending to Gemini...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro', // Changed from gemini-2.5-pro to stable version
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent scoring
        topP: 0.8,
        topK: 20,
      }
    });
    
    let result;
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      // Send PDF as inline data
      result = await model.generateContent([
        {
          inlineData: {
            data: resumeText,
            mimeType: 'application/pdf'
          }
        },
        { text: prompt }
      ]);
    } else {
      // Send DOCX text
      result = await model.generateContent([
        { text: `Resume Content:\n${resumeText}\n\n${prompt}` }
      ]);
    }

    const response = result.response;
    let aiText = response.text();
    
    console.log('[resume.scan] Got response from Gemini');

    // Clean markdown code blocks if present
    aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    let jsonOut;
    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : aiText;
      jsonOut = JSON.parse(jsonStr);
    } catch (err) {
      console.error('[resume.scan] JSON parse error:', err.message);
      return res.status(502).json({ 
        error: 'Failed to parse JSON from Gemini response', 
        details: err.message, 
        raw: aiText 
      });
    }

    const elapsed = Date.now() - startTime;
    console.log('[resume.scan] ✓ Completed in', elapsed, 'ms');
    return res.json({ source: 'gemini', durationMs: elapsed, result: jsonOut });
    
  } catch (err) {
    console.error('[resume.scan] ❌ Error:', err);
    console.error('[resume.scan] Error stack:', err.stack);
    
    // More detailed error handling
    let errorMessage = 'Resume scan failed';
    let errorDetails = err?.message || 'Unknown error';
    
    // Handle specific Gemini API errors
    if (err?.message?.includes('API key')) {
      errorMessage = 'Invalid API key';
      errorDetails = 'The Gemini API key is invalid or expired';
    } else if (err?.message?.includes('quota')) {
      errorMessage = 'API quota exceeded';
      errorDetails = 'Gemini API quota has been exceeded. Please try again later.';
    } else if (err?.message?.includes('model')) {
      errorMessage = 'Model not available';
      errorDetails = 'The AI model is not available. Please contact support.';
    } else if (err?.message?.includes('timeout')) {
      errorMessage = 'Request timeout';
      errorDetails = 'The request took too long. Please try with a smaller file.';
    }
    
    return res.status(500).json({ 
      error: errorMessage, 
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
