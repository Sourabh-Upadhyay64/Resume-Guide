import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api, type ATSResult } from "@/lib/api";

const ResumeScanner = () => {
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a resume file first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.scanResume(file);
      setResult(response.result);
      setUploaded(true);
      toast({
        title: "✨ Resume Scanned Successfully!",
        description: `Analysis completed in ${(response.durationMs / 1000).toFixed(1)}s`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    setUploaded(false);
    setResult(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Resume Scanner</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your resume and get instant ATS optimization feedback powered by AI
          </p>
        </div>

        {!uploaded ? (
          <Card className="glass-card p-12 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all animate-scale-in">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-muted-foreground mb-4">
                  Support for PDF and DOCX files up to 5MB
                </p>
                {file && (
                  <div className="flex items-center justify-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30 max-w-md mx-auto">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <div className="flex gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-2"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Choose File
                </Button>
                <Button
                  size="lg"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Scan Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : result ? (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-card p-8 hover-lift">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted" />
                    <circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.atsScore / 100)}`}
                      className="transition-all duration-1000" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(243 75% 59%)" />
                        <stop offset="100%" stopColor="hsl(262 83% 70%)" />
                      </linearGradient>
                    </defs>
                  </svg>
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
