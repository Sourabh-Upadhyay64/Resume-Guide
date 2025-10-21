import { generate } from '../utils/geminiClient.js';

export const generateQuestions = async (req, res) => {
  console.log('[questions.generate] Start');
  try {
    const { jobTitle, yoe, resumeText } = req.body;
    if (!jobTitle || !yoe) return res.status(400).json({ error: 'jobTitle and yoe are required' });

    const prompt = `You are a professional interviewer. Based on the candidate's resume, job title, and experience, generate 10 detailed interview questions. Include both technical and HR questions.

Return ONLY valid JSON array in this EXACT format, no markdown, no explanations:
[
  {"category": "Technical", "question": "detailed technical question here"},
  {"category": "HR", "question": "detailed HR question here"}
]

Job Title: ${jobTitle}
Experience: ${yoe}
Resume:
${resumeText || 'No resume provided'}`;

    console.log('[questions.generate] Sending prompt to Gemini...');
    const result = await generate(prompt, { temperature: 0.3, maxOutputTokens: 1500 });
    const elapsed = result.duration;

    let aiText = result.text;
    
    // Clean markdown code blocks if present
    aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const match = aiText.match(/\[[\s\S]*\]/);
      const jsonStr = match ? match[0] : aiText;
      const jsonOut = JSON.parse(jsonStr);
      console.log('[questions.generate] ✓ Completed in', elapsed, 'ms');
      return res.json({ source: 'gemini', durationMs: elapsed, questions: jsonOut });
    } catch (err) {
      console.error('[questions.generate] JSON parse error:', err.message);
      return res.status(502).json({ 
        error: 'Failed to parse JSON from Gemini response', 
        details: err.message, 
        raw: aiText 
      });
    }
  } catch (err) {
    console.error('[questions.generate] Error', err);
    const message = err?.error?.message || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Question generation failed', details: message });
  }
};
