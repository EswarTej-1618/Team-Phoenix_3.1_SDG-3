import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MotherBabyHeartAnimation from "@/components/MotherBabyHeartAnimation";
import Navbar from "@/components/Navbar";
import OurMissionSection from "@/components/OurMissionSection";
import FeaturesSection from "@/components/FeaturesSection";
import LiveVitalsSection from "@/components/LiveVitalsSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 xl:px-16 pt-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated dots/particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-12">
          {/* Left side - Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4"
            >
              Safe<span className="text-primary">MOM</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Get personalized maternal health insights based on real-time monitoring. 
              Make informed decisions and protect your pregnancy with AI-powered guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={() => navigate("/role-select")}
                className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started →
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/live-vitals")}
                className="rounded-full px-8 py-6 text-lg border-primary text-primary hover:bg-primary/10 transition-all duration-300"
              >
                Live Vitals
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex items-center gap-2 mt-8 justify-center lg:justify-start"
            >
              <span className="w-2 h-2 rounded-full bg-health-good animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Updated Maternal Health Data in Real-Time
              </span>
            </motion.div>
          </div>

          {/* Right side - Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 flex items-center justify-center scale-100 lg:scale-125 xl:scale-[1.35]"
          >
            <MotherBabyHeartAnimation />
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section - before Features */}
      <OurMissionSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Live Vitals Section */}
      <LiveVitalsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Index;
