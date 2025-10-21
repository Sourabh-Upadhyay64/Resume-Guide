import { generate } from '../utils/geminiClient.js';

export const matchJD = async (req, res) => {
  console.log('[jd.match] Start');
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) return res.status(400).json({ error: 'resumeText and jobDescription are required' });

    const prompt = `Compare this resume and job description. Analyze the match and provide detailed feedback.

Return ONLY valid JSON in this EXACT format, no markdown, no explanations:
{
  "matchScore": (number 0-100),
  "matchedSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["missing1", "missing2", "missing3"],
  "suggestions": "brief feedback to improve alignment"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    console.log('[jd.match] Sending prompt to Gemini...');
    const result = await generate(prompt, { temperature: 0.2, maxOutputTokens: 1500 });
    const elapsed = result.duration;

    let aiText = result.text;
    
    // Clean markdown code blocks if present
    aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : aiText;
      const jsonOut = JSON.parse(jsonStr);
      console.log('[jd.match] ✓ Completed in', elapsed, 'ms');
      return res.json({ source: 'gemini', durationMs: elapsed, match: jsonOut });
    } catch (err) {
      console.error('[jd.match] JSON parse error:', err.message);
      return res.status(502).json({ 
        error: 'Failed to parse JSON from Gemini response', 
        details: err.message, 
        raw: aiText 
      });
    }
  } catch (err) {
    console.error('[jd.match] Error', err);
    const message = err?.error?.message || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'JD matching failed', details: message });
  }
};
