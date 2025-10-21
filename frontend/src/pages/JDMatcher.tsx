import { useState, useRef } from "react";
import { GitCompare, CheckCircle, XCircle, TrendingUp, Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, type JDMatchResult } from "@/lib/api";

const JDMatcher = () => {
  const [matched, setMatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JDMatchResult | null>(null);
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
      setFile(selectedFile);
    }
  };

  const handleMatch = async () => {
    if (!file) {
      toast({
        title: "No Resume Uploaded",
        description: "Please upload your resume first",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please enter the job description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.matchJD({
        resumeText: `Resume file: ${file.name}`,
        jobDescription,
      });
      
      setResult(response.match);
      setMatched(true);
      toast({
        title: "✨ Match Complete!",
        description: `Analysis completed in ${(response.durationMs / 1000).toFixed(1)}s`,
      });
    } catch (error) {
      toast({
        title: "Match Failed",
        description: error instanceof Error ? error.message : "Failed to match resume with JD",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium mb-2 animate-pulse-glow">
            <span className="gradient-text">🎯 Smart Matching Engine</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">JD Matcher</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Compare your resume with job descriptions to find perfect matches
          </p>
        </div>

        <Card className="glass-card p-6 animate-scale-in neon-border">
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Your Resume
            </Label>
            {!file ? (
              <div 
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:animate-pulse-glow">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Click to upload</p>
                <p className="text-xs text-muted-foreground">PDF or DOCX (Max 5MB)</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-xs hover:text-destructive">
                  Remove
                </Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileSelect} className="hidden" />
          </div>
        </Card>

        <Card className="glass-card p-6 neon-border animate-scale-in">
          <Label htmlFor="job-description" className="text-lg font-semibold mb-3 block flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-accent" />
            Job Description
          </Label>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[300px] bg-card/50 border-primary/20 focus:border-primary resize-none"
          />
        </Card>

        {!matched && (
          <div className="text-center">
            <Button
              onClick={handleMatch}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 px-12 h-14 text-lg font-semibold relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <GitCompare className="w-6 h-6 mr-2" />
                  Match Now
                </>
              )}
            </Button>
          </div>
        )}

        {matched && result && (
          <div className="space-y-6 animate-fade-in-up">
            <Card className="glass-card p-8 hover-lift neon-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Match Score</h2>
                  <div className="text-5xl font-bold gradient-text animate-glow-pulse">{result.matchScore}%</div>
                </div>
                <Progress value={result.matchScore} className="h-4 bg-muted/50" />
                <p className="text-muted-foreground text-lg">
                  {result.matchScore >= 80 
                    ? "Excellent match! Your profile aligns very well with this position."
                    : result.matchScore >= 60
                    ? "Good match! Focus on adding the missing skills below to improve further."
                    : "Your resume needs improvement to better align with this job description."}
                </p>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card p-6 hover-lift neon-border relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10" />
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary animate-glow-pulse" />
                  Matching Skills ({result.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/20 text-primary border border-primary/40 px-4 py-2 text-sm hover:bg-primary/30 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="glass-card p-6 hover-lift neon-border border-destructive/30 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-destructive/20 to-transparent rounded-full blur-3xl -z-10" />
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-destructive animate-glow-pulse" />
                  Missing Keywords ({result.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-destructive/20 text-destructive border border-destructive/40 px-4 py-2 text-sm hover:bg-destructive/30 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="glass-card p-6 hover-lift neon-border relative overflow-hidden">
              <div className="absolute top-0 left-1/2 w-64 h-64 bg-gradient-to-b from-accent/20 to-transparent rounded-full blur-3xl -z-10 transform -translate-x-1/2" />
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-accent animate-glow-pulse" />
                Suggestions to Improve Match
              </h3>
              <div className="p-4 bg-card/30 rounded-lg">
                <p className="text-sm leading-relaxed">{result.suggestions}</p>
              </div>
            </Card>

            <div className="text-center">
              <Button variant="outline" size="lg" onClick={() => { setMatched(false); setResult(null); }} className="border-2 hover-lift">
                Match Another JD
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JDMatcher;
