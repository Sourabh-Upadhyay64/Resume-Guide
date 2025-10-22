import { Link, useLocation } from "react-router-dom";
import { FileSearch, Sparkles, GitCompare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/resume-scanner", label: "Resume Scanner", icon: FileSearch },
    { path: "/job-questions", label: "Job Questions", icon: Sparkles },
    { path: "/jd-matcher", label: "JD Matcher", icon: GitCompare },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-all">
              <FileSearch className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-2xl font-bold gradient-text">ATS-Insight</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Get Started Button */}
          <Button className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg">
            Get Started
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              );
            })}
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
