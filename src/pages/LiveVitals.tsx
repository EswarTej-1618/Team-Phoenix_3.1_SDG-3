import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Brain, Droplets, Activity, Cookie, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMotherProfileById } from "@/data/motherProfiles";

type VitalStatus = "good" | "warning" | "danger";
type VitalTrend = "up" | "down" | "stable";

interface VitalData {
  value: number;
  unit: string;
  status: VitalStatus;
  trend: VitalTrend;
  normalRange: string;
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
  unit: string,
  normalRange: string
): VitalData => {
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  let status: VitalStatus = "good";
  if (value >= dangerThreshold) status = "danger";
  else if (value >= warningThreshold) status = "warning";
  const trends: VitalTrend[] = ["up", "down", "stable"];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  return { value, unit, status, trend, normalRange };
};

const LiveVitals = () => {
  const { user } = useAuth();
  const motherProfile = user?.role === "mother" ? getMotherProfileById(user.id) : null;
  const [vitals, setVitals] = useState<VitalsState>({
    heartRate: { value: 78, unit: "bpm", status: "good", trend: "stable", normalRange: "60-100 bpm" },
    stress: { value: 35, unit: "%", status: "good", trend: "stable", normalRange: "< 50%" },
    spo2: { value: 98, unit: "%", status: "good", trend: "stable", normalRange: "95-100%" },
    bloodPressure: { value: 120, unit: "mmHg", status: "good", trend: "stable", normalRange: "< 130 mmHg" },
    glucose: { value: 95, unit: "mg/dL", status: "good", trend: "stable", normalRange: "70-120 mg/dL" },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals({
        heartRate: generateRandomVital(65, 100, 90, 100, "bpm", "60-100 bpm"),
        stress: generateRandomVital(20, 70, 50, 65, "%", "< 50%"),
        spo2: generateRandomVital(94, 100, 95, 94, "%", "95-100%"),
        bloodPressure: generateRandomVital(110, 145, 130, 140, "mmHg", "< 130 mmHg"),
        glucose: generateRandomVital(80, 140, 120, 130, "mg/dL", "70-120 mg/dL"),
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
      glowColor: "shadow-[0_0_30px_hsl(350_85%_60%/0.3)]",
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
      glowColor: "shadow-[0_0_30px_hsl(38_92%_50%/0.3)]",
    },
    {
      id: "spo2",
      title: "SpO₂ Level",
      icon: Droplets,
      data: vitals.spo2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      glowColor: "shadow-[0_0_30px_hsl(205_100%_55%/0.3)]",
    },
    {
      id: "bloodPressure",
      title: "Blood Pressure",
      icon: Activity,
      data: vitals.bloodPressure,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
      glowColor: "shadow-[0_0_30px_hsl(175_70%_45%/0.3)]",
    },
    {
      id: "glucose",
      title: "Glucose Level",
      icon: Cookie,
      data: vitals.glucose,
      color: "text-health-good",
      bgColor: "bg-health-good/10",
      borderColor: "border-health-good/30",
      glowColor: "shadow-[0_0_30px_hsl(142_76%_45%/0.3)]",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
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
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-health-good animate-pulse" />
              <span className="text-sm font-medium text-health-good uppercase tracking-wider">
                Live Monitoring Active
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Real-Time <span className="text-gradient-blue">Vitals Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor maternal health indicators with automatic updates every 3 seconds.
              Stay informed about your health status in real-time.
            </p>
          </motion.div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vitalCards.map((card, index) => (
              <VitalCard key={card.id} card={card} index={index} />
            ))}
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-6 glass-card rounded-xl text-center"
          >
            <p className="text-sm text-muted-foreground">
              ⚠️ <strong>Medical Disclaimer:</strong> This is simulated demo data for demonstration purposes only. 
              For actual health monitoring, please consult with your healthcare provider.
            </p>
          </motion.div>
        </div>
      </div>

      <AIChatbot
        vitals={{
          heartRate: {
            ...vitals.heartRate,
            status: vitals.heartRate.status === "good" ? "Normal" : vitals.heartRate.status === "warning" ? "Moderate" : "Risky",
          },
          stress: {
            ...vitals.stress,
            status: vitals.stress.status === "good" ? "Normal" : vitals.stress.status === "warning" ? "Moderate" : "Risky",
          },
          spo2: {
            ...vitals.spo2,
            status: vitals.spo2.status === "good" ? "Normal" : vitals.spo2.status === "warning" ? "Moderate" : "Risky",
          },
          bloodPressure: {
            ...vitals.bloodPressure,
            status: vitals.bloodPressure.status === "good" ? "Normal" : vitals.bloodPressure.status === "warning" ? "Moderate" : "Risky",
          },
          glucose: {
            ...vitals.glucose,
            status: vitals.glucose.status === "good" ? "Normal" : vitals.glucose.status === "warning" ? "Moderate" : "Risky",
          },
        }}
        motherProfile={motherProfile ?? undefined}
      />
    </div>
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
    glowColor: string;
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
  const statusLabels = {
    good: "Normal",
    warning: "Elevated",
    danger: "High Risk",
  };
  const TrendIcon = card.data.trend === "up" ? TrendingUp : card.data.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`glass-card rounded-2xl p-6 border ${card.borderColor} ${card.glowColor} transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center`}>
          {card.animated ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Icon className={`w-7 h-7 ${card.color}`} strokeWidth={1.5} />
            </motion.div>
          ) : (
            <Icon className={`w-7 h-7 ${card.color}`} strokeWidth={1.5} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-4 h-4 ${statusColors[card.data.status]}`} />
          <div className={`w-3 h-3 rounded-full ${card.data.status === "good" ? "bg-health-good" : card.data.status === "warning" ? "bg-health-warning" : "bg-health-danger"} animate-pulse`} />
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <motion.span
          key={card.data.value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl font-bold ${statusColors[card.data.status]}`}
        >
          {card.data.value}
        </motion.span>
        <span className="text-xl text-muted-foreground ml-2">{card.data.unit}</span>
      </div>

      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-foreground">{card.title}</p>
          <p className="text-sm text-muted-foreground">Normal: {card.data.normalRange}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${card.bgColor} ${card.color}`}>
          {statusLabels[card.data.status]}
        </span>
      </div>
    </motion.div>
  );
};

export default LiveVitals;
