import { motion } from "framer-motion";
import { ArrowLeft, Bot, MessageCircle, Brain, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageCircle,
    title: "Conversational Interface",
    description: "Natural, friendly conversations in simple language that everyone can understand.",
  },
  {
    icon: Brain,
    title: "AI-Powered Guidance",
    description: "Get instant health insights and recommendations based on your symptoms and data.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your health data is encrypted and protected with enterprise-grade security.",
  },
  {
    icon: Users,
    title: "For Everyone",
    description: "Designed for mothers, ASHA workers, nurses, and healthcare providers alike.",
  },
];

const AIBots = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back button */}
          <Link to="/">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              SafeMOM <span className="text-gradient-blue">AI Assistant</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your 24/7 maternal health companion. Get instant answers, health guidance, 
              and support throughout your pregnancy journey.
            </p>
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center glass-card rounded-2xl p-8 border-primary/30"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to chat with SafeMOM AI?
            </h2>
            <p className="text-muted-foreground mb-6">
              Click the chat button in the bottom right corner to start a conversation.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Available 24/7 • Text-based • Voice-ready (coming soon)</span>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              ⚠️ SafeMOM AI provides guidance only and does not replace professional medical advice.
              Always consult your healthcare provider for medical concerns.
            </p>
          </motion.div>
        </div>
      </div>

      <AIChatbot />
    </div>
  );
};

export default AIBots;
