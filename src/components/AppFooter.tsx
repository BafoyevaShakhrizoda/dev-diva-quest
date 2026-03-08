import { Link } from "react-router-dom";
import logo from "@/assets/devgirlzz-logo.png";
import { Github, Twitter, Linkedin } from "lucide-react";

const AppFooter = () => (
  <footer className="border-t border-border bg-card mt-12">
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src={logo} alt="DevGirlzz" className="h-7 w-7 object-contain" />
            <span className="font-display text-lg font-bold text-foreground">
              Dev<span className="text-gradient">Girlzz</span>
            </span>
          </Link>
          <p className="text-xs font-body text-muted-foreground text-center md:text-left">
            Built for every IT woman 💜 Your journey starts here.
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-5 text-xs font-body text-muted-foreground">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/careers" className="hover:text-primary transition-colors">Careers</Link>
          <Link to="/test" className="hover:text-primary transition-colors">Skill Test</Link>
          <Link to="/resources" className="hover:text-primary transition-colors">Resources</Link>
          <Link to="/cv" className="hover:text-primary transition-colors">CV Builder</Link>
        </nav>

        {/* Social */}
        <div className="flex items-center gap-3">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
            <Github size={14} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
            <Twitter size={14} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
            <Linkedin size={14} />
          </a>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-[11px] font-body text-muted-foreground">
          © {new Date().getFullYear()} DevGirlzz. Empowering women in technology.
        </p>
      </div>
    </div>
  </footer>
);

export default AppFooter;
