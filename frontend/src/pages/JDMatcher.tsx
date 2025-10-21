import { useState, useRef } from "react";
import { GitCompare, FileText, Upload, CheckCircle2, XCircle, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api, type JDMatchResult } from "@/lib/api";

const JDMatcher = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JDMatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
      // Extract text from file for preview (simplified)
      const reader = new FileReader();
      reader.onload = () => {
        toast({
          title: "Resume Uploaded",
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleMatch = async () => {
    if (!resumeText && !resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload a resume or paste resume text",
        variant: "destructive",
      });
      return;
    }

    if (!jdText.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter the job description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.matchJD({
        resumeText: resumeText || "Resume from uploaded file",
        jdText,
      });
      setResult(response.result);
      toast({
        title: "✨ Analysis Complete!",
        description: `Match score: ${response.result.matchScore}% (${(response.durationMs / 1000).toFixed(1)}s)`,
      });
    } catch (error) {
      toast({
        title: "Matching Failed",
        description: error instanceof Error ? error.message : "Failed to match resume with JD",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setResumeText("");
    setJdText("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">JD Matcher</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Compare your resume with job descriptions to find the perfect match powered by AI
          </p>
        </div>

        {!result ? (
          <div className="grid lg:grid-cols-2 gap-6 animate-scale-in">
            <Card className="glass-card p-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="w-5 h-5 text-primary" />
                  Your Resume
                </Label>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/60 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="resume-upload"
                    />
                    {resumeFile ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResumeFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Upload Resume</p>
                          <p className="text-sm text-muted-foreground">PDF or DOCX up to 5MB</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[300px] border-2"
                  />
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Job Description
                </Label>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="min-h-[400px] border-2"
                />
              </div>
            </Card>

            <div className="lg:col-span-2 flex justify-center">
              <Button
                size="lg"
                onClick={handleMatch}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-5 h-5 mr-2" />
                    Match Resume with JD
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-card p-8 hover-lift">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted" />
                    <circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.matchScore / 100)}`}
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
                      <div className="text-4xl font-bold gradient-text">{result.matchScore}%</div>
                      <div className="text-sm text-muted-foreground">Match</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {result.matchScore >= 80 ? "Excellent Match! 🎉" : result.matchScore >= 60 ? "Good Match! 👍" : "Needs Improvement 📝"}
                    </h2>
                    <p className="text-muted-foreground">
                      Your resume alignment with the job requirements
                    </p>
                  </div>
                  <Progress value={result.matchScore} className="h-3" />
                </div>
              </div>
            </Card>

            {result.matchedSkills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Matched Skills ({result.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm font-medium hover-lift"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Missing Skills ({result.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-full text-sm font-medium hover-lift"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  Suggestions for Improvement
                </h3>
                <div className="grid gap-4">
                  {result.suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="glass-card p-4 hover-lift border-l-4 border-l-accent"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="text-sm">{suggestion}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center pt-4">
              <Button variant="outline" size="lg" onClick={handleReset} className="border-2 hover-lift">
                Compare New Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JDMatcher;
