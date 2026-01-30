import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const OurMissionSection = () => {
  return (
    <section id="mission" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header - similar to Powerful Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="text-gradient-blue">Mission</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every mother deserves informed care. We exist to make maternal health visible, understandable, and actionable.
          </p>
        </motion.div>

        {/* Mission card - similar styling to feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-xl p-8 md:p-12 border-border/50 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center text-center">
            {/* Quote icon */}
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Quote className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>

            {/* Mission quote */}
            <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6">
              &ldquo;To empower every mother and caregiver with real-time insight and AI-guided support—so that no pregnancy is left to guesswork, and every heartbeat is seen.&rdquo;
            </blockquote>

            <p className="text-muted-foreground text-base">
              SafeMOM combines live vitals, WHO-aligned risk assessment, and a caring AI to help mothers and health workers make better decisions, together.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OurMissionSection;
