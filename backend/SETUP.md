# 🔧 Backend Setup Guide

## ✅ What Was Fixed

### 1. **Gemini API Integration** (Fixed ✓)
**Problem**: The original `geminiClient.js` used incorrect API structure (`GenerativeServiceClient` doesn't exist)

**Solution**: Updated to use correct `@google/generative-ai` SDK:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

### 2. **Prompt Flow** (Fixed ✓)
**Problem**: Controllers weren't properly sending prompts or extracting responses

**Solution**: 
- Added detailed, structured prompts in each controller
- Proper response extraction: `result.text` from Gemini
- Added markdown cleanup to handle ```json blocks
- Improved JSON parsing with better error handling

### 3. **Environment Variables** (Fixed ✓)
**Problem**: No `.env` file existed, only `.env.example`

**Solution**: Created `backend/.env` with:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
```

---

## 🚀 Quick Start

### Step 1: Get Your API Key
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Update .env File
Open `backend/.env` and replace `your_gemini_api_key_here` with your actual key:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key
PORT=4000
```

### Step 3: Install & Run
```powershell
cd c:\Users\soura\insight-ats-ai\backend
npm install
npm start
```

You should see:
```
Server running on port 4000
```

---

## 🧪 Test the API

### Test Health Endpoint
```powershell
# Using curl (if available)
curl http://localhost:4000/api/health

# Or open in browser
# http://localhost:4000/api/health
```

Expected response:
```json
{"status":"OK"}
```

### Test Question Generation (with PowerShell)
```powershell
$body = @{
    jobTitle = "Frontend Developer"
    yoe = "0-2 years"
    resumeText = "React developer with 2 years experience"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/questions/generate" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 📊 How It Works Now

### Resume Scanner Flow:
1. User uploads PDF/DOCX → Multer saves to `uploads/`
2. Extract text using `pdf-parse` or `mammoth`
3. Send structured prompt to Gemini: "Analyze and return JSON with atsScore, strengths, improvements, summary"
4. Gemini generates response
5. Extract JSON from response (cleaning markdown if present)
6. Return to client

### Question Generator Flow:
1. User sends { jobTitle, yoe, resumeText }
2. Generate prompt: "Create 10 interview questions for [role] with [experience]"
3. Gemini generates array of questions
4. Parse and return JSON

### JD Matcher Flow:
1. User sends { resumeText, jobDescription }
2. Generate prompt: "Compare resume vs JD and return matchScore, skills, suggestions"
3. Gemini analyzes both
4. Return structured comparison

---

## 🔍 Debugging Tips

### If you see "GEMINI_API_KEY is not set"
- Check that `.env` file exists in `backend/` folder
- Verify the key is on the line: `GEMINI_API_KEY=your_key`
- Restart the server after editing `.env`

### If you get JSON parse errors
- Check the response in the `raw` field of error
- Gemini might return markdown formatted JSON (```json blocks)
- The code now cleans this automatically

### If file upload fails
- Ensure you're sending `multipart/form-data`
- Field name must be `file`
- Supported: PDF and DOCX files

---

## 📦 Dependencies Explained

```json
{
  "@google/generative-ai": "^1.0.0",  // Official Gemini SDK
  "body-parser": "^1.20.2",            // Parse JSON bodies
  "cors": "^2.8.5",                    // Enable cross-origin requests
  "dotenv": "^16.3.1",                 // Load .env variables
  "express": "^4.18.2",                // Web framework
  "mammoth": "^1.4.21",                // Extract text from DOCX
  "multer": "^1.4.5-lts.1",            // Handle file uploads
  "pdf-parse": "^1.1.1"                // Extract text from PDF
}
```

---

## 🎯 Next Steps

1. ✅ Verify your API key works by testing `/api/questions/generate`
2. ✅ Test resume upload with a sample PDF/DOCX
3. ✅ Connect your frontend to these endpoints
4. 🔄 (Optional) Add rate limiting for production
5. 🔄 (Optional) Deploy to Render/Railway/Vercel

---

## 💡 Pro Tips

- **API Key Security**: Never commit `.env` to git (already in `.gitignore`)
- **Rate Limits**: Gemini free tier has request limits - cache results when possible
- **Response Time**: First API call may be slow (~2-3s), subsequent calls faster
- **File Size**: Limit resume uploads to < 5MB for best performance
- **Error Handling**: All endpoints return descriptive errors with details

---

## Need Help?

Check these files for implementation details:
- `utils/geminiClient.js` - Core Gemini integration
- `controllers/resumeController.js` - Resume scanning logic
- `controllers/questionController.js` - Question generation
- `controllers/matcherController.js` - JD matching
