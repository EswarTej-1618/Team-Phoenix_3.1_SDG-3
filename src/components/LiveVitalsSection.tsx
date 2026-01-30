import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Brain, Droplets, Activity, Cookie } from "lucide-react";

type VitalStatus = "good" | "warning" | "danger";
type VitalTrend = "up" | "down" | "stable";

interface VitalData {
  value: number;
  unit: string;
  status: VitalStatus;
  trend: VitalTrend;
}

interface VitalsState {
  heartRate: VitalData;
  stress: VitalData;
  spo2: VitalData;
  bloodPressure: VitalData;
  glucose: VitalData;
}

const generateRandomVital = (
  min: number, 
  max: number, 
  warningThreshold: number, 
  dangerThreshold: number,
  unit: string
): VitalData => {
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  let status: VitalStatus = "good";
  if (value >= dangerThreshold) status = "danger";
  else if (value >= warningThreshold) status = "warning";
  const trends: VitalTrend[] = ["up", "down", "stable"];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  return { value, unit, status, trend };
};

const LiveVitalsSection = () => {
  const [vitals, setVitals] = useState<VitalsState>({
    heartRate: { value: 78, unit: "bpm", status: "good", trend: "stable" },
    stress: { value: 35, unit: "%", status: "good", trend: "stable" },
    spo2: { value: 98, unit: "%", status: "good", trend: "stable" },
    bloodPressure: { value: 120, unit: "mmHg", status: "good", trend: "stable" },
    glucose: { value: 95, unit: "mg/dL", status: "good", trend: "stable" },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals({
        heartRate: generateRandomVital(65, 100, 90, 100, "bpm"),
        stress: generateRandomVital(20, 70, 50, 65, "%"),
        spo2: generateRandomVital(94, 100, 95, 94, "%"),
        bloodPressure: generateRandomVital(110, 145, 130, 140, "mmHg"),
        glucose: generateRandomVital(80, 140, 120, 130, "mg/dL"),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const vitalCards = [
    {
      id: "heartRate",
      title: "Heart Rate",
      icon: Heart,
      data: vitals.heartRate,
      color: "text-heart",
      bgColor: "bg-heart/10",
      borderColor: "border-heart/30",
      animated: true,
    },
    {
      id: "stress",
      title: "Stress Level",
      icon: Brain,
      data: vitals.stress,
      color: "text-health-warning",
      bgColor: "bg-health-warning/10",
      borderColor: "border-health-warning/30",
    },
    {
      id: "spo2",
      title: "SpO₂",
      icon: Droplets,
      data: vitals.spo2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      id: "bloodPressure",
      title: "Blood Pressure",
      icon: Activity,
      data: vitals.bloodPressure,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
    {
      id: "glucose",
      title: "Glucose",
      icon: Cookie,
      data: vitals.glucose,
      color: "text-health-good",
      bgColor: "bg-health-good/10",
      borderColor: "border-health-good/30",
    },
  ];

  return (
    <section id="live-vitals" className="py-24 px-6 lg:px-12">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-health-good animate-pulse" />
            <span className="text-sm font-medium text-health-good">Live Data</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time <span className="text-gradient-blue">Vitals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor maternal health indicators in real-time with automatic risk assessment.
          </p>
        </motion.div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vitalCards.map((card, index) => (
            <VitalCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface VitalCardProps {
  card: {
    id: string;
    title: string;
    icon: React.ElementType;
    data: VitalData;
    color: string;
    bgColor: string;
    borderColor: string;
    animated?: boolean;
  };
  index: number;
}

const VitalCard = ({ card, index }: VitalCardProps) => {
  const Icon = card.icon;
  const statusColors = {
    good: "text-health-good",
    warning: "text-health-warning",
    danger: "text-health-danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-card rounded-xl p-5 border ${card.borderColor} hover:shadow-lg transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
          {card.animated ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.5} />
            </motion.div>
          ) : (
            <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.5} />
          )}
        </div>
        <div className={`w-2 h-2 rounded-full ${card.data.status === "good" ? "bg-health-good" : card.data.status === "warning" ? "bg-health-warning" : "bg-health-danger"} animate-pulse`} />
      </div>

      {/* Value */}
      <div className="mb-2">
        <motion.span
          key={card.data.value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-3xl font-bold ${statusColors[card.data.status]}`}
        >
          {card.data.value}
        </motion.span>
        <span className="text-sm text-muted-foreground ml-1">{card.data.unit}</span>
      </div>

      {/* Title */}
      <p className="text-sm text-muted-foreground">{card.title}</p>
    </motion.div>
  );
};

export default LiveVitalsSection;
