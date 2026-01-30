import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight, LogOut, Stethoscope, MessageCircle, Clock, MoreVertical, Check, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { AshaDashboard } from "@/components/AshaDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import {
  patientsByPriority,
  type Patient,
  type RiskLevel,
} from "@/data/patients";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const riskColors: Record<RiskLevel, string> = {
  high: "hsl(var(--destructive))",
  medium: "hsl(var(--health-warning))",
  low: "hsl(var(--health-good))",
};

const riskDotClass: Record<RiskLevel, string> = {
  high: "bg-destructive",
  medium: "bg-[hsl(var(--health-warning))]",
  low: "bg-[hsl(var(--health-good))]",
};

const riskLabelClass: Record<RiskLevel, string> = {
  high: "text-destructive font-semibold",
  medium: "text-[hsl(var(--health-warning))]",
  low: "text-[hsl(var(--health-good))]",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function journeyToChartData(patient: Patient) {
  const order: Record<RiskLevel, number> = { high: 2, medium: 1, low: 0 };
  return patient.journey.map((j) => ({
    week: `Week ${j.week}`,
    risk: order[j.riskLevel],
    riskLabel: j.riskLevel.charAt(0).toUpperCase() + j.riskLevel.slice(1),
    ...j,
  }));
}

const PatientDetails = () => {
  const { user, logout, isAsha } = useAuth();
  const [selected, setSelected] = useState<Patient | null>(patientsByPriority[0] ?? null);

  const selectedPatient = selected ?? patientsByPriority[0] ?? null;
  const chartData = selectedPatient ? journeyToChartData(selectedPatient) : [];

  // Patient assessment state (synced from selected patient vitals)
  const [headache, setHeadache] = useState<boolean>(selectedPatient?.vitals?.headache ?? false);
  const [swelling, setSwelling] = useState<boolean>(selectedPatient?.vitals?.swelling ?? false);
  const [bpInput, setBpInput] = useState(
    selectedPatient?.vitals?.bloodPressure
      ? `${selectedPatient.vitals.bloodPressure.systolic} / ${selectedPatient.vitals.bloodPressure.diastolic}`
      : ""
  );

  useEffect(() => {
    if (selectedPatient) {
      setHeadache(selectedPatient.vitals?.headache ?? false);
      setSwelling(selectedPatient.vitals?.swelling ?? false);
      setBpInput(
        selectedPatient.vitals?.bloodPressure
          ? `${selectedPatient.vitals.bloodPressure.systolic} / ${selectedPatient.vitals.bloodPressure.diastolic}`
          : ""
      );
    }
  }, [selectedPatient?.id]);

  // ASHA worker view: patient list, summary cards, Add New Mother
  if (isAsha) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 pt-24 pb-12">
          <AshaDashboard ashaName={user?.name ?? "Rani Devi"} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 pt-24 pb-12">
        {/* Header: Clinician Dashboard */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clinician Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              High-risk patients and overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary">
                  <Stethoscope className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name ?? "Doctor"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={logout}
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Patient Assessment Section - symptom/vital input + risk status */}
        {selectedPatient && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {getInitials(selectedPatient.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-base font-medium text-foreground">
                  Patient: {selectedPatient.name}, {selectedPatient.weeksPregnant} weeks pregnant
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Messages">
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="History">
                  <Clock className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="More options">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Symptom / vital cards */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-foreground mb-3">Do you have a headache?</p>
                    <div className="flex gap-2">
                      <Button
                        variant={headache ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setHeadache(true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={!headache ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setHeadache(false)}
                      >
                        No
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-foreground mb-3">Have you experienced any swelling?</p>
                    <div className="flex gap-2">
                      <Button
                        variant={swelling ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setSwelling(true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={!swelling ? "default" : "outline"}
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setSwelling(false)}
                      >
                        No
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-foreground mb-3">What is your blood pressure?</p>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="e.g. 120 / 80"
                        value={bpInput}
                        onChange={(e) => setBpInput(e.target.value)}
                        className="max-w-[180px]"
                      />
                      <span className="text-sm text-muted-foreground">mmHg</span>
                      {bpInput.trim() && (
                        <span className="text-[hsl(var(--health-good))]" aria-hidden>
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Risk status + Next steps */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                      Risk Status
                    </p>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div
                        className={`flex items-center justify-center w-32 h-32 rounded-full text-white font-bold text-lg ${
                          selectedPatient.riskLevel === "high"
                            ? "bg-destructive"
                            : selectedPatient.riskLevel === "medium"
                              ? "bg-[hsl(var(--health-warning))]"
                              : "bg-[hsl(var(--health-good))]"
                        }`}
                      >
                        {selectedPatient.riskLevel === "high"
                          ? "HIGH RISK"
                          : selectedPatient.riskLevel === "medium"
                            ? "MEDIUM RISK"
                            : "LOW RISK"}
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Concerns: {selectedPatient.keyFactors.join(", ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-foreground mb-3">Next Steps:</p>
                    <div
                      className={`rounded-lg px-4 py-3 text-sm font-medium text-white ${
                        selectedPatient.riskLevel === "high"
                          ? "bg-destructive"
                          : selectedPatient.riskLevel === "medium"
                            ? "bg-[hsl(var(--health-warning))]"
                            : "bg-[hsl(var(--health-good))]"
                      }`}
                    >
                      {selectedPatient.recommendation}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: High-Risk Patients list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">High-Risk Patients</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sorted by priority (high → medium → low)
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[280px] pr-4">
                  <ul className="space-y-1">
                    {patientsByPriority.map((patient) => {
                      const isSelected = selectedPatient?.id === patient.id;
                      return (
                        <li key={patient.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(patient)}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-secondary border border-border"
                                : "hover:bg-muted/50 border border-transparent"
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${riskDotClass[patient.riskLevel]}`}
                              aria-hidden
                            />
                            <span className="flex-1 min-w-0 font-medium text-foreground truncate">
                              {patient.name}
                            </span>
                            <span
                              className={`text-xs shrink-0 capitalize ${riskLabelClass[patient.riskLevel]}`}
                            >
                              {patient.riskLevel} risk
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 shrink-0 text-muted-foreground ${
                                isSelected ? "text-primary" : ""
                              }`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Patient Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Patient Overview</CardTitle>
                {selectedPatient && (
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {getInitials(selectedPatient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{selectedPatient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.weeksPregnant} weeks pregnant
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={selectedPatient.riskLevel === "high" ? "destructive" : "secondary"}
                      className={
                        selectedPatient.riskLevel === "high"
                          ? ""
                          : selectedPatient.riskLevel === "medium"
                            ? "bg-[hsl(var(--health-warning))]/20 text-[hsl(var(--health-warning))] border-0"
                            : "bg-[hsl(var(--health-good))]/20 text-[hsl(var(--health-good))] border-0"
                      }
                    >
                      {selectedPatient.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {selectedPatient ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Key Factors
                      </p>
                      <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                        {selectedPatient.keyFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Recommendation
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          selectedPatient.riskLevel === "high"
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {selectedPatient.recommendation}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Select a patient from the list.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom: Pregnancy Journey + Risk Analysis */}
        {selectedPatient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedPatient.name} – Pregnancy Journey
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Risk level over pregnancy weeks
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis
                          dataKey="week"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, 2]}
                          ticks={[0, 1, 2]}
                          tickFormatter={(v) =>
                            v === 0 ? "Low" : v === 1 ? "Medium" : "High"
                          }
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        />
                        <Tooltip
                          content={({ active, payload }) =>
                            active && payload?.length ? (
                              <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow">
                                <p className="font-medium">{payload[0].payload.week}</p>
                                <p className="text-muted-foreground capitalize">
                                  {payload[0].payload.riskLabel} Risk
                                </p>
                              </div>
                            ) : null
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="risk"
                          stroke={riskColors[selectedPatient.riskLevel]}
                          strokeWidth={2}
                          dot={{ r: 4, fill: riskColors[selectedPatient.riskLevel] }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Current: {selectedPatient.weeksPregnant} weeks · Risk:{" "}
                      <span className={riskLabelClass[selectedPatient.riskLevel]}>
                        {selectedPatient.riskLevel}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPatient.journey[selectedPatient.journey.length - 1]?.details ??
                      "No additional details."}
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    Follow-up: {selectedPatient.recommendation}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={selectedPatient.riskLevel === "high" ? "destructive" : "secondary"}
                      className={
                        selectedPatient.riskLevel === "high"
                          ? ""
                          : selectedPatient.riskLevel === "medium"
                            ? "bg-[hsl(var(--health-warning))]/20 text-[hsl(var(--health-warning))] border-0"
                            : "bg-[hsl(var(--health-good))]/20 text-[hsl(var(--health-good))] border-0"
                      }
                    >
                      {selectedPatient.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Reasons</p>
                    <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                      {selectedPatient.riskReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Recommendations
                    </p>
                    <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                      {selectedPatient.riskRecommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDetails;
