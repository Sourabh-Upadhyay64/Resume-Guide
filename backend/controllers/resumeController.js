import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

export const scanResume = async (req, res) => {
  console.log('[resume.scan] Start');
  const startTime = Date.now();
  
  // Get API key at runtime, not at module load time
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[resume.scan] GEMINI_API_KEY not found in environment');
    return res.status(500).json({ error: 'Server configuration error: API key missing' });
  }
  
  console.log('[resume.scan] API Key:', apiKey.substring(0, 10) + '...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

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

    const prompt = `Analyze the following resume and provide a JSON output with the EXACT format below. Return ONLY valid JSON, no markdown, no explanations:

{
  "atsScore": (number 0-100),
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
  "summary": "brief summary of candidate profile"
}`;

    console.log('[resume.scan] Sending to Gemini...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
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
    console.error('[resume.scan] Error:', err);
    const message = err?.error?.message || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Resume scan failed', details: message });
  }
};
