import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  User,
  Calendar,
  Pencil,
  Menu,
  HelpCircle,
  ChevronRight,
  Plus,
  UserCircle,
  Stethoscope,
  Droplets,
  Scale,
  Activity,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getMotherProfile } from "@/data/patients";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function bpStatus(systolic: number, diastolic: number): { label: string; className: string } {
  if (systolic >= 140 || diastolic >= 90) return { label: "High", className: "text-destructive" };
  if (systolic >= 120 || diastolic >= 80) return { label: "Elevated", className: "text-[hsl(var(--health-warning))]" };
  return { label: "Normal", className: "text-[hsl(var(--health-good))]" };
}

function hbStatus(hb: number): { label: string; className: string } {
  if (hb < 10) return { label: "Low", className: "text-destructive" };
  if (hb < 11) return { label: "Borderline", className: "text-[hsl(var(--health-warning))]" };
  return { label: "Normal", className: "text-[hsl(var(--health-good))]" };
}

const MotherDashboard = () => {
  const { user } = useAuth();
  const profile = getMotherProfile();

  const [activeTab, setActiveTab] = useState("personal");

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No profile data available.</p>
      </div>
    );
  }

  const { patient, detail } = profile;
  const vitals = patient.vitals;
  const bp = vitals.bloodPressure;
  const bpDisplay = bp ? `${bp.systolic} / ${bp.diastolic}` : "—";
  const bpStat = bp ? bpStatus(bp.systolic, bp.diastolic) : { label: "—", className: "text-muted-foreground" };
  const hb = vitals.hemoglobin ?? 0;
  const hbStat = hb > 0 ? hbStatus(hb) : { label: "—", className: "text-muted-foreground" };
  const isHighRisk = patient.riskLevel === "high";
  const highRiskReason = patient.keyFactors[0] ?? "High risk";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Header: profile pic, name, age, blood type, edit, menu, help */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl">
                <AvatarFallback className="rounded-xl bg-primary/20 text-primary text-xl">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Edit profile">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Age: {detail.age} · {detail.bloodType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu">
                <Menu className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Help">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs: Personal Info, Medical Profile, Language */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="medical" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Medical Profile
              </TabsTrigger>
              <TabsTrigger value="language" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Language
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-5 space-y-5">
              {/* Personal Info card */}
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{detail.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{detail.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">Husband: {detail.husbandName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">
                      {detail.scheduledVisit} · {detail.scheduledVisitTime}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Pregnancy Status card */}
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCircle className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Pregnancy Status</h2>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Pregnancy {patient.weeksPregnant} weeks
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Due Date: {detail.dueDate}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Health Indicators card */}
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">Health Indicators</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Stethoscope className="w-4 h-4" />
                        BP
                      </div>
                      <p className="font-medium text-foreground text-sm">{bpDisplay}</p>
                      <p className={cn("text-xs font-medium", bpStat.className)}>{bpStat.label}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Droplets className="w-4 h-4" />
                        Sugar
                      </div>
                      <p className="font-medium text-foreground text-sm">{detail.sugar ?? "—"} mg/dL</p>
                      <p className="text-xs font-medium text-[hsl(var(--health-good))]">Normal</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Droplets className="w-4 h-4" />
                        Hemoglobin
                      </div>
                      <p className="font-medium text-foreground text-sm">{hb > 0 ? `${hb} g/dL` : "—"}</p>
                      <p className={cn("text-xs font-medium", hbStat.className)}>{hbStat.label}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Scale className="w-4 h-4" />
                        Weight
                      </div>
                      <p className="font-medium text-foreground text-sm">{detail.weight ?? "—"} kg</p>
                      <p className="text-xs font-medium text-[hsl(var(--health-warning))]">
                        {detail.weightStatus ?? "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Last Updated: {detail.lastUpdated}</p>
                </CardContent>
              </Card>

              {/* High Risk section - only when patient is high risk (matches doc/ASHA) */}
              {isHighRisk && (
                <Card className="rounded-2xl overflow-hidden border-destructive/50 bg-destructive/5">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h2 className="font-semibold text-foreground">
                          HIGH RISK PATIENTS (5)
                        </h2>
                      </div>
                      <Button size="sm" className="rounded-lg gap-1">
                        <Plus className="w-4 h-4" />
                        Add New Visit
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {highRiskReason} · Last Visit: {detail.lastVisit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="medical" className="mt-5">
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <h2 className="font-semibold text-foreground mb-3">Medical Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Key factors: {patient.keyFactors.join(", ")}.
                  </p>
                  <p className="text-sm text-foreground mt-2 font-medium">
                    {patient.recommendation}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="mt-5">
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <h2 className="font-semibold text-foreground mb-3">Language</h2>
                  <p className="text-sm text-muted-foreground">Preferred language: English</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default MotherDashboard;
