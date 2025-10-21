# Insight ATS AI - Backend

Lightweight Express backend that integrates with **Gemini 1.5 Pro** for intelligent resume scanning, interview question generation, and job description matching.

---

## 🚀 Quick Setup

### 1. Get Your Gemini API Key
Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and create a free API key.

### 2. Configure Environment Variables
Open `backend/.env` and add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=4000
```

### 3. Install Dependencies
```powershell
cd backend
npm install
```

### 4. Start the Server
```powershell
npm start
```

Server will start on `http://localhost:4000`

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "OK" }
```

### 1️⃣ Resume Scanner
```
POST /api/resume/scan
Content-Type: multipart/form-data

Form field: file (PDF or DOCX)

Response:
{
  "source": "gemini",
  "durationMs": 1234,
  "result": {
    "atsScore": 85,
    "strengths": ["Strong technical skills", "..."],
    "improvements": ["Add more metrics", "..."],
    "summary": "Experienced developer with..."
  }
}
```

### 2️⃣ Question Generator
```
POST /api/questions/generate
Content-Type: application/json

Body:
{
  "jobTitle": "Frontend Developer",
  "yoe": "0-2 years",
  "resumeText": "optional resume text"
}

Response:
{
  "source": "gemini",
  "durationMs": 1500,
  "questions": [
    {"category": "Technical", "question": "..."},
    {"category": "HR", "question": "..."}
  ]
}
```

### 3️⃣ JD Matcher
```
POST /api/jd/match
Content-Type: application/json

Body:
{
  "resumeText": "candidate's resume text",
  "jobDescription": "job requirements and description"
}

Response:
{
  "source": "gemini",
  "durationMs": 1800,
  "match": {
    "matchScore": 78,
    "matchedSkills": ["React", "JavaScript", "..."],
    "missingSkills": ["TypeScript", "Testing", "..."],
    "suggestions": "Consider adding..."
  }
}
```

---

## 🛠️ Technical Details

- **Framework**: Express.js (ESM modules)
- **AI Model**: Google Gemini 1.5 Pro via `@google/generative-ai`
- **File Parsing**: `pdf-parse` (PDF), `mammoth` (DOCX)
- **File Upload**: `multer` with disk storage
- **No Database**: Stateless design
- **No Authentication**: Direct API calls

---

## 📝 Notes

- Uploads are stored in `backend/uploads/` (created automatically)
- All Gemini responses are parsed for JSON output
- Clear error messages with raw output on parse failures
- Timing logs for each API call
- CORS enabled for frontend integration
