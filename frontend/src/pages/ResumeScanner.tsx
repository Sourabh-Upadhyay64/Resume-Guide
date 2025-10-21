import { useState, useRef } from "react";import { useState } from "react";

import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, Loader2 } from "lucide-react";import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";import { Card } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";import { Progress } from "@/components/ui/progress";

import { useToast } from "@/hooks/use-toast";

import { api, type ATSResult } from "@/lib/api";const ResumeScanner = () => {

  const [uploaded, setUploaded] = useState(false);

const ResumeScanner = () => {  const [score] = useState(72);

  const [file, setFile] = useState<File | null>(null);

  const [uploaded, setUploaded] = useState(false);  const suggestions = [

  const [loading, setLoading] = useState(false);    { type: "error", text: "Missing important keywords like 'leadership', 'project management'" },

  const [result, setResult] = useState<ATSResult | null>(null);    { type: "warning", text: "Use more action verbs to describe achievements" },

  const fileInputRef = useRef<HTMLInputElement>(null);    { type: "error", text: "Formatting inconsistency detected in work experience section" },

  const { toast } = useToast();    { type: "success", text: "Contact information is clear and professional" },

    { type: "warning", text: "Consider adding quantifiable metrics to achievements" },

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {    { type: "error", text: "Skills section could be more comprehensive" },

    const selectedFile = e.target.files?.[0];  ];

    if (selectedFile) {

      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];  const handleUpload = () => {

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {    setUploaded(true);

        toast({  };

          title: "Invalid File Type",

          description: "Please upload a PDF or DOCX file",  return (

          variant: "destructive",    <div className="min-h-screen py-12 px-6">

        });      <div className="container mx-auto max-w-5xl space-y-8">

        return;        <div className="text-center space-y-4 animate-fade-in">

      }          <h1 className="text-4xl md:text-5xl font-bold">

            <span className="gradient-text">Resume Scanner</span>

      if (selectedFile.size > 5 * 1024 * 1024) {          </h1>

        toast({          <p className="text-muted-foreground text-lg">

          title: "File Too Large",            Upload your resume and get instant ATS optimization feedback

          description: "Please upload a file smaller than 5MB",          </p>

          variant: "destructive",        </div>

        });

        return;        {!uploaded ? (

      }          <Card className="glass-card p-12 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer animate-scale-in">

            <div className="text-center space-y-6">

      setFile(selectedFile);              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">

    }                <Upload className="w-10 h-10 text-white" />

  };              </div>

              <div>

  const handleUpload = async () => {                <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>

    if (!file) {                <p className="text-muted-foreground">

      toast({                  Support for PDF and DOCX files up to 5MB

        title: "No File Selected",                </p>

        description: "Please select a resume file first",              </div>

        variant: "destructive",              <Button 

      });                size="lg" 

      return;                onClick={handleUpload}

    }                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"

              >

    setLoading(true);                <FileText className="w-5 h-5 mr-2" />

    try {                Choose File

      const response = await api.scanResume(file);              </Button>

      setResult(response.result);            </div>

      setUploaded(true);          </Card>

      toast({        ) : (

        title: "✨ Resume Scanned Successfully!",          <div className="space-y-6 animate-fade-in">

        description: `Analysis completed in ${(response.durationMs / 1000).toFixed(1)}s`,            {/* ATS Score */}

      });            <Card className="glass-card p-8 hover-lift">

    } catch (error) {              <div className="flex flex-col md:flex-row items-center gap-8">

      toast({                <div className="relative w-40 h-40 flex-shrink-0">

        title: "Scan Failed",                  <svg className="w-full h-full -rotate-90">

        description: error instanceof Error ? error.message : "Failed to scan resume",                    <circle

        variant: "destructive",                      cx="80"

      });                      cy="80"

    } finally {                      r="70"

      setLoading(false);                      stroke="currentColor"

    }                      strokeWidth="12"

  };                      fill="none"

                      className="text-muted"

  const handleRescan = () => {                    />

    setUploaded(false);                    <circle

    setResult(null);                      cx="80"

    setFile(null);                      cy="80"

    if (fileInputRef.current) {                      r="70"

      fileInputRef.current.value = '';                      stroke="url(#gradient)"

    }                      strokeWidth="12"

  };                      fill="none"

                      strokeDasharray={`${2 * Math.PI * 70}`}

  return (                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}

    <div className="min-h-screen py-12 px-6">                      className="transition-all duration-1000"

      <div className="container mx-auto max-w-5xl space-y-8">                      strokeLinecap="round"

        <div className="text-center space-y-4 animate-fade-in">                    />

          <h1 className="text-4xl md:text-5xl font-bold">                    <defs>

            <span className="gradient-text">Resume Scanner</span>                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">

          </h1>                        <stop offset="0%" stopColor="hsl(243 75% 59%)" />

          <p className="text-muted-foreground text-lg">                        <stop offset="100%" stopColor="hsl(262 83% 70%)" />

            Upload your resume and get instant ATS optimization feedback powered by AI                      </linearGradient>

          </p>                    </defs>

        </div>                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">

        {!uploaded ? (                    <div className="text-center">

          <Card className="glass-card p-12 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all animate-scale-in">                      <div className="text-4xl font-bold gradient-text">{score}</div>

            <div className="text-center space-y-6">                      <div className="text-sm text-muted-foreground">ATS Score</div>

              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">                    </div>

                <Upload className="w-10 h-10 text-white" />                  </div>

              </div>                </div>

              <div>

                <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>                <div className="flex-1 space-y-4">

                <p className="text-muted-foreground mb-4">                  <div>

                  Support for PDF and DOCX files up to 5MB                    <h2 className="text-2xl font-bold mb-2">Good Progress!</h2>

                </p>                    <p className="text-muted-foreground">

                {file && (                      Your resume shows potential, but there's room for improvement. Check the suggestions below.

                  <div className="flex items-center justify-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30 max-w-md mx-auto">                    </p>

                    <FileText className="w-5 h-5 text-primary" />                  </div>

                    <span className="text-sm font-medium truncate flex-1">{file.name}</span>                  <Progress value={score} className="h-3" />

                    <span className="text-xs text-muted-foreground">                </div>

                      {(file.size / 1024 / 1024).toFixed(2)} MB              </div>

                    </span>            </Card>

                  </div>

                )}            {/* Suggestions */}

              </div>            <div>

              <input              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">

                ref={fileInputRef}                <TrendingUp className="w-5 h-5 text-primary" />

                type="file"                Improvement Suggestions

                accept=".pdf,.docx"              </h3>

                onChange={handleFileSelect}              <div className="grid gap-4">

                className="hidden"                {suggestions.map((suggestion, index) => (

                id="resume-upload"                  <Card

              />                    key={index}

              <div className="flex gap-3 justify-center">                    className={`glass-card p-4 hover-lift ${

                <Button                       suggestion.type === "error"

                  size="lg"                         ? "border-l-4 border-l-destructive"

                  onClick={() => fileInputRef.current?.click()}                        : suggestion.type === "warning"

                  variant="outline"                        ? "border-l-4 border-l-secondary"

                  className="border-2"                        : "border-l-4 border-l-primary"

                >                    }`}

                  <FileText className="w-5 h-5 mr-2" />                    style={{ animationDelay: `${index * 100}ms` }}

                  Choose File                  >

                </Button>                    <div className="flex items-start gap-3">

                <Button                       {suggestion.type === "error" ? (

                  size="lg"                         <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />

                  onClick={handleUpload}                      ) : suggestion.type === "success" ? (

                  disabled={!file || loading}                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />

                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"                      ) : (

                >                        <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />

                  {loading ? (                      )}

                    <>                      <p className="text-sm">{suggestion.text}</p>

                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />                    </div>

                      Scanning...                  </Card>

                    </>                ))}

                  ) : (              </div>

                    <>            </div>

                      <Upload className="w-5 h-5 mr-2" />

                      Scan Resume            {/* Actions */}

                    </>            <div className="flex gap-4 justify-center">

                  )}              <Button 

                </Button>                variant="outline" 

              </div>                size="lg"

            </div>                onClick={() => setUploaded(false)}

          </Card>                className="border-2 hover-lift"

        ) : result ? (              >

          <div className="space-y-6 animate-fade-in">                Re-scan Resume

            <Card className="glass-card p-8 hover-lift">              </Button>

              <div className="flex flex-col md:flex-row items-center gap-8">              <Button 

                <div className="relative w-40 h-40 flex-shrink-0">                size="lg"

                  <svg className="w-full h-full -rotate-90">                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"

                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted" />              >

                    <circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none"                 Download Report

                      strokeDasharray={`${2 * Math.PI * 70}`}              </Button>

                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.atsScore / 100)}`}            </div>

                      className="transition-all duration-1000" strokeLinecap="round" />          </div>

                    <defs>        )}

                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">      </div>

                        <stop offset="0%" stopColor="hsl(243 75% 59%)" />    </div>

                        <stop offset="100%" stopColor="hsl(262 83% 70%)" />  );

                      </linearGradient>};

                    </defs>

                  </svg>export default ResumeScanner;

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold gradient-text">{result.atsScore}</div>
                      <div className="text-sm text-muted-foreground">ATS Score</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {result.atsScore >= 80 ? "Excellent!" : result.atsScore >= 60 ? "Good Progress!" : "Needs Improvement"}
                    </h2>
                    <p className="text-muted-foreground">{result.summary}</p>
                  </div>
                  <Progress value={result.atsScore} className="h-3" />
                </div>
              </div>
            </Card>

            {result.strengths.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Your Strengths
                </h3>
                <div className="grid gap-4">
                  {result.strengths.map((strength, index) => (
                    <Card key={index} className="glass-card p-4 hover-lift border-l-4 border-l-primary">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{strength}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {result.improvements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Improvement Suggestions
                </h3>
                <div className="grid gap-4">
                  {result.improvements.map((improvement, index) => (
                    <Card key={index} className="glass-card p-4 hover-lift border-l-4 border-l-accent">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{improvement}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={handleRescan} className="border-2 hover-lift">
                Re-scan Resume
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResumeScanner;
