import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full border-b border-border/50 bg-background/95 backdrop-blur-sm fixed top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <span className="text-primary">toggl</span>
            <span className="text-foreground">track</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              Product <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              Solutions <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              Resources <ChevronDown className="w-4 h-4" />
            </button>
            <a href="#enterprise" className="text-foreground hover:text-primary transition-colors">
              Enterprise
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Book a demo
          </Button>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild variant="hero" size="lg" className="rounded-full">
            <Link to="/signup">Try for free</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
