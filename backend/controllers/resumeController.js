import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import { generate } from '../utils/geminiClient.js';

const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Helper function to parse PDF
function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData) => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    
    pdfParser.loadPDF(filePath);
  });
}

export const scanResume = async (req, res) => {
  console.log('[resume.scan] Start');
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      text = await parsePDF(filePath);
    } else if (
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      req.file.originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      // try to read as text fallback
      text = fs.readFileSync(filePath, 'utf8');
    }

    if (!text || text.trim().length === 0) {
      return res.status(500).json({ error: 'Failed to extract text from resume' });
    }

    const prompt = `Analyze the following resume and provide a JSON output with the EXACT format below. Return ONLY valid JSON, no markdown, no explanations:

{
  "atsScore": (number 0-100),
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
  "summary": "brief summary of candidate profile"
}

Resume:
${text}`;

    console.log('[resume.scan] Sending prompt to Gemini...');
    const result = await generate(prompt, { temperature: 0.2, maxOutputTokens: 1024 });
    const elapsed = result.duration;

    // Extract text from Gemini response
    let aiText = result.text;

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

    console.log('[resume.scan] ✓ Completed in', elapsed, 'ms');
    return res.json({ source: 'gemini', durationMs: elapsed, result: jsonOut });
  } catch (err) {
    console.error('[resume.scan] Error', err);
    const message = err?.error?.message || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Resume scan failed', details: message });
  }
};
