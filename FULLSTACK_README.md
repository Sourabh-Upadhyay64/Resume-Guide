# Insight ATS AI - Full Stack Setup

Complete guide to run the Express + React full-stack ATS application with Gemini AI integration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 1: Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
# Open backend/.env and add your Gemini API key:
# GEMINI_API_KEY=your_actual_key_here
# PORT=4000

# Start backend server
npm start
```

Backend will run on `http://localhost:4000`

### Step 2: Frontend Setup

```powershell
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
bun install
# or: npm install

# Start frontend dev server
bun run dev
# or: npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🎯 Features

### 1. Resume Scanner (`/resume-scanner`)
- Upload PDF/DOCX resume
- Get ATS score (0-100)
- View strengths and improvements
- Powered by Gemini AI analysis

### 2. Job Question Generator (`/job-questions`)
- Enter job title and experience level
- Optional: upload resume for personalized questions
- Generate 10 AI-powered interview questions
- Mix of technical and HR questions

### 3. JD Matcher (`/jd-matcher`)
- Upload your resume
- Paste job description
- Get match score with detailed analysis
- See matching skills, missing keywords, and suggestions

---

## 🔧 Architecture

```
Frontend (React + Vite)
      ↓  HTTP Requests
Backend (Express.js)
      ↓  API Calls
Gemini 1.5 Pro API
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/resume/scan` | POST | Scan resume (multipart/form-data) |
| `/api/questions/generate` | POST | Generate questions (JSON) |
| `/api/jd/match` | POST | Match resume with JD (JSON) |

---

## 📦 Tech Stack

### Backend
- **Framework**: Express.js (ESM)
- **AI**: @google/generative-ai (Gemini 1.5 Pro)
- **File Processing**: pdf2json, mammoth
- **Upload**: multer
- **Environment**: dotenv

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **UI**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React

---

## 🧪 Testing the Integration

### 1. Test Backend Health
```powershell
# PowerShell
Invoke-RestMethod http://localhost:4000/api/health
```

Expected: `{"status":"OK"}`

### 2. Test Frontend → Backend

1. Open `http://localhost:5173` in browser
2. Go to Resume Scanner
3. Upload a sample PDF/DOCX resume
4. Click "Scan Resume"
5. View AI-generated analysis

### 3. Test Question Generation

1. Go to Job Questions page
2. Enter job title (e.g., "Software Engineer")
3. Select experience level
4. Click "Generate Questions"
5. View 10 AI-generated questions

### 4. Test JD Matching

1. Go to JD Matcher page
2. Upload resume
3. Paste a job description
4. Click "Match Now"
5. View match score, skills analysis, and suggestions

---

## 🐛 Troubleshooting

### Backend Issues

**"GEMINI_API_KEY is not set"**
- Check `backend/.env` file exists
- Verify API key is correct
- Restart backend server

**"Failed to parse JSON from Gemini"**
- Check Gemini API quota/limits
- Verify API key is valid
- Check backend console for raw response

**"ENOENT: no such file or directory"**
- Ensure `backend/uploads/` folder exists (created automatically)
- Check file permissions

### Frontend Issues

**"Failed to fetch" / Network Error**
- Verify backend is running on port 4000
- Check browser console for CORS errors
- Ensure both servers are running

**File upload not working**
- Check file type (must be PDF or DOCX)
- Check file size (max 5MB)
- Verify backend multer configuration

---

## 📊 Expected Response Times

- Resume Scan: 2-5 seconds
- Question Generation: 1-3 seconds
- JD Matching: 2-4 seconds

*Times vary based on file size and Gemini API response time*

---

## 🔐 Security Notes

- `.env` is gitignored (never commit API keys)
- File uploads limited to 5MB
- Only PDF/DOCX accepted
- CORS enabled for local development

---

## 🚢 Deployment

### Backend (Render/Railway/Vercel)
1. Set `GEMINI_API_KEY` environment variable
2. Set `PORT` (or use default 4000)
3. Deploy from `backend/` directory

### Frontend (Vercel/Netlify)
1. Update API URL in `frontend/src/lib/api.ts`
2. Build: `bun run build` or `npm run build`
3. Deploy `dist/` folder

---

## 📝 File Structure

```
insight-ats-ai/
├── backend/
│   ├── controllers/        # Request handlers
│   │   ├── resumeController.js
│   │   ├── questionController.js
│   │   └── matcherController.js
│   ├── routes/            # Express routes
│   │   ├── resumeRoutes.js
│   │   ├── questionRoutes.js
│   │   └── matcherRoutes.js
│   ├── utils/
│   │   └── geminiClient.js  # Gemini API wrapper
│   ├── uploads/            # Temporary file storage
│   ├── .env               # Environment variables
│   ├── server.js          # Express app
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/    # UI components
    │   ├── pages/         # Route pages (integrated)
    │   │   ├── ResumeScanner.tsx
    │   │   ├── JobQuestions.tsx
    │   │   └── JDMatcher.tsx
    │   ├── lib/
    │   │   └── api.ts     # Backend API client
    │   └── main.tsx
    └── package.json
```

---

## ✅ Integration Checklist

- [x] Backend connects to Gemini API
- [x] Frontend makes API calls to backend
- [x] File uploads work (PDF/DOCX)
- [x] Resume scanning returns structured JSON
- [x] Question generation works
- [x] JD matching works
- [x] Error handling with toast notifications
- [x] Loading states during API calls
- [x] Response data displayed in UI

---

## 🎉 You're All Set!

Your full-stack ATS AI application is now running with:
- ✅ Express backend on port 4000
- ✅ React frontend on port 5173
- ✅ Gemini AI integration
- ✅ Real-time resume analysis
- ✅ Interview question generation
- ✅ JD matching with detailed insights

**Next Steps**: Upload a resume, generate questions, or match with a job description!
