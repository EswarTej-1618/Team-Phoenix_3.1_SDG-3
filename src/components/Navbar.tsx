import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Activity, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === "/";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "AI Bots", href: "/ai-bots", icon: Bot },
    { name: "Live Vitals", href: "/live-vitals", icon: Activity },
    { name: "Features", href: isHome ? "#features" : "/#features" },
    { name: "Contact", href: isHome ? "#contact" : "/#contact" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const hash = href.startsWith("/#") ? href.slice(1) : href;
    if (hash.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 150);
      } else {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - SafeMOM with oval logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="h-10 w-8 overflow-hidden rounded-[50%] bg-card flex-shrink-0 flex items-center justify-center p-0.5">
                <img
                  src="/safemom-logo.png"
                  alt="SafeMOM"
                  className="w-full h-full object-contain object-center"
                />
              </div>
              <span className="text-xl font-semibold text-foreground hidden sm:inline">
                Safe<span className="text-primary">MOM</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => {
                  if (link.href.startsWith("#") || link.href.startsWith("/#")) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side: theme toggle + buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button
              variant="outline"
              onClick={() => navigate("/role-select")}
              className="rounded-full px-6 border-border hover:bg-secondary transition-all duration-300"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/role-select")}
              className="rounded-full px-6 shadow-soft hover:shadow-card transition-all duration-300"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="text-foreground p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => {
                    if (link.href.startsWith("#") || link.href.startsWith("/#")) {
                      handleNavClick(link.href);
                    }
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/role-select");
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 rounded-full"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    navigate("/role-select");
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 rounded-full"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
