import { generate } from '../utils/geminiClient.js';

export const generateQuestions = async (req, res) => {
  console.log('[questions.generate] Start');
  try {
    const { jobTitle, yoe, resumeText } = req.body;
    if (!jobTitle || !yoe) return res.status(400).json({ error: 'jobTitle and yoe are required' });

    const prompt = `Generate 10 interview questions with brief answers for this role:
Job: ${jobTitle}
Experience: ${yoe} years
${resumeText ? 'Resume: ' + resumeText.substring(0, 500) : ''}

Return ONLY valid JSON array. NO markdown. NO explanations.

STRICT FORMAT:
[
{"category":"Technical","question":"Your question here?","answer":"Brief answer in one paragraph without line breaks."},
{"category":"Behavioral","question":"Your question here?","answer":"Brief answer in one paragraph without line breaks."}
]

RULES:
- Keep answers to 2-3 sentences maximum
- No line breaks in answers
- Use categories: Technical, Behavioral, Situational, Experience, Leadership, Problem Solving
- Match difficulty to ${yoe} years experience
- Return ONLY the JSON array, nothing else`;

    console.log('[questions.generate] Prompt length:', prompt.length);

    console.log('[questions.generate] Sending prompt to Gemini...');
    const result = await generate(prompt, { temperature: 0.2, maxOutputTokens: 4000 });
    const elapsed = result.duration;

    let aiText = result.text;
    console.log('[questions.generate] Raw response length:', aiText.length);
    
    // Clean markdown code blocks if present
    aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      // Extract JSON array
      const match = aiText.match(/\[[\s\S]*\]/);
      if (!match) {
        throw new Error('No JSON array found in response');
      }
      
      let jsonStr = match[0];
      
      // Aggressive cleaning of the JSON string to fix common issues
      // Fix unescaped newlines in strings
      jsonStr = jsonStr.replace(/(?<!\\)\n/g, ' ');
      // Fix unescaped quotes (but not already escaped ones)
      jsonStr = jsonStr.replace(/([^\\])"([^",:}\]]*)"([^,:}\]])/g, '$1\\"$2\\"$3');
      // Remove multiple spaces
      jsonStr = jsonStr.replace(/\s+/g, ' ');
      
      console.log('[questions.generate] Cleaned JSON length:', jsonStr.length);
      
      const jsonOut = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!Array.isArray(jsonOut)) {
        throw new Error('Response is not an array');
      }
      
      // Clean up each question/answer to ensure proper formatting
      const cleanedQuestions = jsonOut.map(q => ({
        category: q.category || 'General',
        question: (q.question || '').trim(),
        answer: (q.answer || 'No answer provided').trim()
      }));
      
      console.log('[questions.generate] ✓ Completed in', elapsed, 'ms -', cleanedQuestions.length, 'questions');
      return res.json({ source: 'gemini', durationMs: elapsed, questions: cleanedQuestions });
    } catch (err) {
      console.error('[questions.generate] JSON parse error:', err.message);
      console.error('[questions.generate] Error at position:', err.message.match(/position (\d+)/)?.[1]);
      
      // Show context around the error
      const errorPos = parseInt(err.message.match(/position (\d+)/)?.[1] || '0');
      if (errorPos > 0) {
        console.error('[questions.generate] Context around error:', aiText.substring(Math.max(0, errorPos - 100), errorPos + 100));
      }
      
      return res.status(502).json({ 
        error: 'Failed to parse JSON from Gemini response', 
        details: err.message,
        hint: 'The AI response contained invalid JSON. Try again or simplify your input.'
      });
    }
  } catch (err) {
    console.error('[questions.generate] Error', err);
    const message = err?.error?.message || err?.message || 'Unknown error';
    return res.status(500).json({ error: 'Question generation failed', details: message });
  }
};
