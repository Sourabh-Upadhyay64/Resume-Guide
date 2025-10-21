import { useState, useRef } from "react";
import { Sparkles, RefreshCw, Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api, type Question } from "@/lib/api";

const JobQuestions = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [yoe, setYoe] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
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

  const handleGenerate = async () => {
    if (!jobTitle || !yoe) {
      toast({
        title: "Missing Information",
        description: "Please fill in job title and experience level",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.generateQuestions({
        jobTitle,
        yoe,
        resumeText: file ? `Resume uploaded: ${file.name}` : undefined,
      });
      
      setQuestions(response.questions);
      setGenerated(true);
      toast({
        title: "✨ Questions Generated!",
        description: `Created ${response.questions.length} questions in ${(response.durationMs / 1000).toFixed(1)}s`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium mb-2 animate-pulse-glow">
            <span className="gradient-text">✨ AI-Powered Interview Prep</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">Job Question Generator</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get AI-powered interview questions tailored to your role and experience
          </p>
        </div>

        <Card className="glass-card p-6 animate-scale-in neon-border">
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Your Resume (Optional)
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

        <Card className="glass-card p-8 animate-scale-in neon-border">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-title" className="text-base">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g., Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="bg-card/50 border-primary/20 focus:border-primary h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-base">Years of Experience *</Label>
              <Select value={yoe} onValueChange={setYoe}>
                <SelectTrigger className="bg-card/50 border-primary/20 focus:border-primary h-12">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/20">
                  <SelectItem value="0-2 years">0-2 years (Entry Level)</SelectItem>
                  <SelectItem value="3-5 years">3-5 years (Mid Level)</SelectItem>
                  <SelectItem value="6-10 years">6-10 years (Senior Level)</SelectItem>
                  <SelectItem value="10+ years">10+ years (Lead/Principal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 h-12 text-base font-semibold relative overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </Card>

        {generated && questions.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary animate-glow-pulse" />
                Generated Interview Questions ({questions.length})
              </h3>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="border-primary/30 hover:bg-primary/10 hover-lift">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>

            <div className="grid gap-4">
              {questions.map((q, index) => (
                <Card key={index} className="glass-card p-6 hover-lift relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg animate-pulse-glow">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <span className="text-xs font-semibold text-primary mb-1 block">{q.category}</span>
                      <p className="text-base leading-relaxed">{q.question}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobQuestions;
