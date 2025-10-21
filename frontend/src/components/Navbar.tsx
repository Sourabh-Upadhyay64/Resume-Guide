import { Link, useLocation } from "react-router-dom";
import { FileSearch, Sparkles, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/resume-scanner", label: "Resume Scanner", icon: FileSearch },
    { path: "/job-questions", label: "Job Question Generator", icon: Sparkles },
    { path: "/jd-matcher", label: "JD Matcher", icon: GitCompare },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-all">
              <FileSearch className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ATS-Insight</span>
          </Link>

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

          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
