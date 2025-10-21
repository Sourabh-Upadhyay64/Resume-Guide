import { generate } from '../utils/geminiClient.js';

export const matchJD = async (req, res) => {
  console.log('[jd.match] Start');
  try {
    const { resumeText, jdText } = req.body;
    if (!resumeText || !jdText) {
      console.error('[jd.match] Missing fields - resumeText:', !!resumeText, 'jdText:', !!jdText);
      return res.status(400).json({ error: 'resumeText and jdText are required' });
    }

    const prompt = `Compare resume with job description. Give match score and top skills.

Resume: ${resumeText.substring(0, 800)}
Job: ${jdText.substring(0, 800)}

Return ONLY this JSON (keep skills lists SHORT - max 3 items each):
{"matchScore":75,"matchedSkills":["skill1","skill2","skill3"],"missingSkills":["skill1","skill2","skill3"],"suggestions":["tip1","tip2"]}

Keep it brief and complete the JSON properly.`;

    console.log('[jd.match] Sending prompt to Gemini...');
    const result = await generate(prompt, { temperature: 0.2, maxOutputTokens: 3000 });
    const elapsed = result.duration;

    let aiText = result.text;
    console.log('[jd.match] Raw response length:', aiText.length);
    
    // Clean markdown code blocks if present
    aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Remove newlines
    aiText = aiText.replace(/\n/g, ' ');
    
    // If JSON is incomplete, try to complete it
    if (aiText.includes('{') && !aiText.endsWith('}')) {
      console.log('[jd.match] Incomplete JSON detected, attempting to fix...');
      // Find last complete field
      const lastComma = aiText.lastIndexOf(',');
      if (lastComma > 0) {
        aiText = aiText.substring(0, lastComma);
      }
      // Close the JSON
      aiText = aiText + '}';
    }

    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('[jd.match] No JSON found. Response:', aiText);
        throw new Error('No JSON object found in response');
      }
      
      let jsonStr = match[0];
      console.log('[jd.match] JSON string:', jsonStr);
      
      const jsonOut = JSON.parse(jsonStr);
      
      // Validate and normalize the structure
      const normalizedResult = {
        matchScore: typeof jsonOut.matchScore === 'number' ? jsonOut.matchScore : 0,
        matchedSkills: Array.isArray(jsonOut.matchedSkills) ? jsonOut.matchedSkills : [],
        missingSkills: Array.isArray(jsonOut.missingSkills) ? jsonOut.missingSkills : [],
        suggestions: Array.isArray(jsonOut.suggestions) ? jsonOut.suggestions : [jsonOut.suggestions || 'No suggestions']
      };
      
      console.log('[jd.match] ✓ Completed in', elapsed, 'ms - Score:', normalizedResult.matchScore);
      return res.json({ source: 'gemini', durationMs: elapsed, result: normalizedResult });
    } catch (err) {
      console.error('[jd.match] JSON parse error:', err.message);
      console.error('[jd.match] Raw response:', aiText.substring(0, 500));
      return res.status(502).json({ 
        error: 'Failed to parse JSON from Gemini response', 
        details: err.message,
        hint: 'The AI response was incomplete or malformed. Try again with shorter text.'
      });
    }
  } catch (err) {
    console.error('[jd.match] Error', err);
    const message = err?.error?.message || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'JD matching failed', details: message });
  }
};
