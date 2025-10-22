import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, Sparkles, GitCompare, Users, TrendingUp, Award } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full glass-card text-xs sm:text-sm font-medium mb-4">
              <span className="gradient-text">🚀 AI-Powered Resume Intelligence</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight px-4">
              Optimize Your Resume.
              <br />
              <span className="gradient-text">Land Your Dream Job.</span>
            </h1>
            
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Scan your resume, generate interview questions, and match it with your target job description — all in one AI-powered platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center pt-4 px-4 max-w-lg sm:max-w-none mx-auto">
              <Link to="/resume-scanner" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-[var(--shadow-glow)] group">
                  <FileSearch className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Scan Resume
                </Button>
              </Link>
              
              <Link to="/job-questions" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-2 hover:border-primary hover-lift">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Questions
                </Button>
              </Link>
              
              <Link to="/jd-matcher" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-2 hover:border-accent hover-lift">
                  <GitCompare className="w-5 h-5 mr-2" />
                  Match JD
                </Button>
              </Link>
            </div>
          </div>

          {/* Illustration Placeholder */}
          <div className="mt-12 sm:mt-16 relative px-4">
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-4xl mx-auto shadow-2xl hover-lift">
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <FileSearch className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">Resume Analysis Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-card rounded-2xl p-6 sm:p-8 text-center hover-lift">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-primary" />
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">10,000+</div>
              <p className="text-sm sm:text-base text-muted-foreground">Job Seekers Trust Us</p>
            </div>
            
            <div className="glass-card rounded-2xl p-6 sm:p-8 text-center hover-lift">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-accent" />
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">95%</div>
              <p className="text-sm sm:text-base text-muted-foreground">ATS Pass Rate</p>
            </div>
            
            <div className="glass-card rounded-2xl p-6 sm:p-8 text-center hover-lift">
              <Award className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-secondary" />
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">50K+</div>
              <p className="text-sm sm:text-base text-muted-foreground">Resumes Optimized</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
