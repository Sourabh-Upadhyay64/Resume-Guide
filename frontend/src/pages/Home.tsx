import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, Sparkles, GitCompare, Users, TrendingUp, Award } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium mb-4">
              <span className="gradient-text">🚀 AI-Powered Resume Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Optimize Your Resume.
              <br />
              <span className="gradient-text">Land Your Dream Job.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Scan your resume, generate interview questions, and match it with your target job description — all in one AI-powered platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/resume-scanner">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-[var(--shadow-glow)] group">
                  <FileSearch className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Scan Resume
                </Button>
              </Link>
              
              <Link to="/job-questions">
                <Button size="lg" variant="outline" className="border-2 hover:border-primary hover-lift">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Questions
                </Button>
              </Link>
              
              <Link to="/jd-matcher">
                <Button size="lg" variant="outline" className="border-2 hover:border-accent hover-lift">
                  <GitCompare className="w-5 h-5 mr-2" />
                  Match JD
                </Button>
              </Link>
            </div>
          </div>

          {/* Illustration Placeholder */}
          <div className="mt-16 relative">
            <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl hover-lift">
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <FileSearch className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-muted-foreground">Resume Analysis Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <div className="text-4xl font-bold gradient-text mb-2">10,000+</div>
              <p className="text-muted-foreground">Job Seekers Trust Us</p>
            </div>
            
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-accent" />
              <div className="text-4xl font-bold gradient-text mb-2">95%</div>
              <p className="text-muted-foreground">ATS Pass Rate</p>
            </div>
            
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <Award className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
              <p className="text-muted-foreground">Resumes Optimized</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
