import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is SafeMOM and how does it help mothers?",
    answer: "SafeMOM is a comprehensive maternal health monitoring platform that uses AI-powered risk assessment to track pregnancy health. It helps mothers, ASHA workers, and healthcare providers monitor vital signs, detect potential risks early, and receive timely guidance throughout the pregnancy journey.",
  },
  {
    question: "How does the AI risk assessment work?",
    answer: "Our AI uses WHO-aligned algorithms to analyze maternal health data including blood pressure, heart rate, SpO₂, temperature, and pregnancy symptoms. It calculates risk levels (Low 🟢, Moderate 🟡, High 🔴) and provides clear, non-technical explanations with recommended next steps.",
  },
  {
    question: "Is SafeMOM suitable for ASHA workers and nurses?",
    answer: "Yes! SafeMOM is designed with simple, friendly language that's accessible to ASHA workers, nurses, and mothers alike. The AI chatbot provides guidance in non-technical terms, making it easy for community health workers to use during home visits.",
  },
  {
    question: "What vital signs can I track with SafeMOM?",
    answer: "SafeMOM supports tracking of key maternal health indicators including: Age, Gestational week, Blood pressure, Heart rate, SpO₂ (oxygen saturation), Temperature, and various pregnancy symptoms. All data is securely stored and analyzed for risk assessment.",
  },
  {
    question: "Does SafeMOM provide medical diagnoses or prescriptions?",
    answer: "No, SafeMOM provides health monitoring and risk assessment guidance only. It includes clear medical disclaimers and recommends consulting healthcare professionals for any medical concerns. The platform is designed to support, not replace, professional medical care.",
  },
  {
    question: "Is my health data secure on SafeMOM?",
    answer: "Absolutely. SafeMOM uses cloud-based architecture with enterprise-grade security. All health data is encrypted, and the platform is designed to be HIPAA-compliant. Multi-clinic support ensures proper data segregation and access controls.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked <span className="text-gradient-blue">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Answers to common questions about SafeMOM and how it helps you stay safe.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl border-border/50 px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
