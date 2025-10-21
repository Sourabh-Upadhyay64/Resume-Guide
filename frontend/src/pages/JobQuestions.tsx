import { useState, useRef } from "react";
import { Sparkles, Briefcase, Calendar, FileText, Loader2, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api, type QuestionResult } from "@/lib/api";

const JobQuestions = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [yoe, setYoe] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [questions, setQuestions] = useState<QuestionResult[] | null>(null);
  const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setResumeFile(selectedFile);
      
      // Set resume text indicator when file is uploaded
      setResumeText(`[Resume uploaded: ${selectedFile.name}]`);
      setExtracting(false);
      toast({
        title: "Resume Uploaded",
        description: `${selectedFile.name} ready to use for personalized questions`,
      });
    }
  };

  const handleGenerate = async () => {
    if (!jobTitle || !yoe) {
      toast({
        title: "Missing Information",
        description: "Please fill in job title and years of experience",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.generateQuestions({
        jobTitle,
        yoe: parseInt(yoe),
        resumeText: resumeText || undefined,
      });
      setQuestions(response.questions);
      toast({
        title: "✨ Questions Generated!",
        description: `${response.questions.length} questions ready in ${(response.durationMs / 1000).toFixed(1)}s`,
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

  const handleReset = () => {
    setJobTitle("");
    setYoe("");
    setResumeText("");
    setResumeFile(null);
    setQuestions(null);
    setVisibleAnswers(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleAnswerVisibility = (index: number) => {
    setVisibleAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const categoryColors: Record<string, string> = {
    Technical: "bg-blue-500/10 text-blue-700 border-blue-200",
    Behavioral: "bg-purple-500/10 text-purple-700 border-purple-200",
    Situational: "bg-green-500/10 text-green-700 border-green-200",
    Experience: "bg-orange-500/10 text-orange-700 border-orange-200",
    Leadership: "bg-pink-500/10 text-pink-700 border-pink-200",
    "Problem Solving": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Interview Questions</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Generate personalized interview questions based on job role and experience powered by AI
          </p>
        </div>

        {!questions ? (
          <Card className="glass-card p-8 animate-scale-in">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Job Title *
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yoe" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Years of Experience *
                  </Label>
                  <Input
                    id="yoe"
                    type="number"
                    placeholder="e.g., 5"
                    value={yoe}
                    onChange={(e) => setYoe(e.target.value)}
                    className="border-2"
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Resume Text (Optional)
                </Label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.docx"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={extracting}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {extracting ? "Extracting..." : "Upload Resume"}
                  </Button>
                  {resumeFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{resumeFile.name}</span>
                      <span>({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume content here or upload a file above for more personalized questions..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[150px] border-2"
                />
                <p className="text-xs text-muted-foreground">
                  Including resume text helps generate more targeted questions
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {jobTitle}
                  </h2>
                  <p className="text-muted-foreground">
                    {yoe} {parseInt(yoe) === 1 ? 'year' : 'years'} of experience • {questions.length} questions generated
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset} className="border-2">
                  Generate New
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <Card
                  key={index}
                  className="glass-card p-6 hover-lift"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[q.category] || "bg-gray-500/10 text-gray-700 border-gray-200"
                          }`}
                        >
                          {q.category}
                        </span>
                      </div>
                      <p className="text-lg font-medium leading-relaxed">
                        {q.question}
                      </p>
                      
                      {q.answer && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAnswerVisibility(index)}
                              className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                              {visibleAnswers.has(index) ? (
                                <>
                                  <EyeOff className="h-4 w-4" />
                                  Hide Answer
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  Show Answer
                                </>
                              )}
                            </Button>
                          </div>
                          {visibleAnswers.has(index) && (
                            <div className="mt-2 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {q.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="border-2 hover-lift"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate New Questions
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobQuestions;
