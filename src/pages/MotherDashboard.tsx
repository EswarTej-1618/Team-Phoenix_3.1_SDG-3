import { useState, useMemo } from "react";
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
  FileText,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { getMotherProfile } from "@/data/patients";
import {
  getMotherProfileById,
  getVitalsHistory,
  type MotherSignupProfile,
} from "@/data/motherProfiles";
import { generateMotherReport } from "@/lib/gemini";
import AIChatbot from "@/components/AIChatbot";
import { EditMotherProfileSheet } from "@/components/EditMotherProfileSheet";
import { MaternalReportDisplay } from "@/components/MaternalReportDisplay";
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
  const [refreshKey, setRefreshKey] = useState(0);
  const storedProfile = useMemo(() => (user ? getMotherProfileById(user.id) : null), [user?.id, refreshKey]);
  const demoProfile = getMotherProfile();

  const [activeTab, setActiveTab] = useState("personal");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const isStoredMother = !!storedProfile;
  const profile = storedProfile ?? (demoProfile ? { patient: demoProfile.patient, detail: demoProfile.detail } : null);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No profile data available.</p>
      </div>
    );
  }

  const patient = isStoredMother ? null : (profile as { patient: typeof demoProfile.patient; detail: typeof demoProfile.detail }).patient;
  const detail = isStoredMother ? null : (profile as { patient: typeof demoProfile.patient; detail: typeof demoProfile.detail }).detail;
  const vitals = patient?.vitals;
  const bp = vitals?.bloodPressure;
  const bpDisplay = bp ? `${bp.systolic} / ${bp.diastolic}` : "—";
  const bpStat = bp ? bpStatus(bp.systolic, bp.diastolic) : { label: "—", className: "text-muted-foreground" };
  const hb = vitals?.hemoglobin ?? 0;
  const hbStat = hb > 0 ? hbStatus(hb) : { label: "—", className: "text-muted-foreground" };
  const isHighRisk = patient?.riskLevel === "high";
  const highRiskReason = patient?.keyFactors?.[0] ?? "High risk";

  const displayName = isStoredMother ? (storedProfile as MotherSignupProfile).name : patient!.name;
  const displayAge = isStoredMother ? (storedProfile as MotherSignupProfile).age : detail!.age;
  const displayBloodType = isStoredMother ? (storedProfile as MotherSignupProfile).bloodGroup : detail!.bloodType;

  const handleGenerateReport = async () => {
    if (!storedProfile) return;
    setReportLoading(true);
    setReportError(null);
    setReportText(null);
    try {
      const history = getVitalsHistory(storedProfile.id);
      const report = await generateMotherReport(storedProfile, history);
      setReportText(report);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  };

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
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                  {isStoredMother && storedProfile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      aria-label="Edit profile"
                      onClick={() => setEditSheetOpen(true)}
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Age: {displayAge} · {displayBloodType}
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
            <TabsList className={cn("w-full rounded-xl bg-muted/50 p-1", isStoredMother ? "grid grid-cols-4" : "grid grid-cols-3")}>
              <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="medical" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Medical Profile
              </TabsTrigger>
              {isStoredMother && (
                <TabsTrigger value="report" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Generate Report
                </TabsTrigger>
              )}
              <TabsTrigger value="language" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Language
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-5 space-y-5">
              {isStoredMother && storedProfile ? (
                <>
                  <Card className="rounded-2xl overflow-hidden">
                    <CardContent className="pt-6 pb-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Primary info</h3>
                        <Button variant="outline" size="sm" onClick={() => setEditSheetOpen(true)} className="gap-1">
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      </div>
                      <div className="grid gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">Name: {storedProfile.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">Email: {storedProfile.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">Age: {storedProfile.age} · Blood group: {storedProfile.bloodGroup || "Not set"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">
                            Gestation: {storedProfile.gestationWeek} weeks · {storedProfile.pregnancyNumber === 1 ? "First" : storedProfile.pregnancyNumber === 2 ? "Second" : `${storedProfile.pregnancyNumber}th`} pregnancy
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Profile vitals */}
                  {(storedProfile.vitals && Object.keys(storedProfile.vitals).length > 0) && (
                    <Card className="rounded-2xl overflow-hidden">
                      <CardContent className="pt-6 pb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-foreground">Health vitals</h2>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setEditSheetOpen(true)} className="gap-1">
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {storedProfile.vitals.weightKg != null && (
                            <div className="rounded-xl bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Weight</p>
                              <p className="font-medium text-foreground text-sm">{storedProfile.vitals.weightKg} kg</p>
                            </div>
                          )}
                          {(storedProfile.vitals.bloodPressureSystolic != null || storedProfile.vitals.bloodPressureDiastolic != null) && (
                            <div className="rounded-xl bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Blood pressure</p>
                              <p className="font-medium text-foreground text-sm">
                                {storedProfile.vitals.bloodPressureSystolic ?? "—"} / {storedProfile.vitals.bloodPressureDiastolic ?? "—"} mmHg
                              </p>
                            </div>
                          )}
                          {storedProfile.vitals.hemoglobin != null && (
                            <div className="rounded-xl bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Hemoglobin</p>
                              <p className="font-medium text-foreground text-sm">{storedProfile.vitals.hemoglobin} g/dL</p>
                            </div>
                          )}
                          {storedProfile.vitals.bloodSugarMgDl != null && (
                            <div className="rounded-xl bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Blood sugar</p>
                              <p className="font-medium text-foreground text-sm">{storedProfile.vitals.bloodSugarMgDl} mg/dL</p>
                            </div>
                          )}
                          {storedProfile.vitals.heartRateBpm != null && (
                            <div className="rounded-xl bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Heart rate</p>
                              <p className="font-medium text-foreground text-sm">{storedProfile.vitals.heartRateBpm} bpm</p>
                            </div>
                          )}
                          {storedProfile.vitals.spo2Percent != null && (
                            <div className="rounded-xl bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">SpO₂</p>
                              <p className="font-medium text-foreground text-sm">{storedProfile.vitals.spo2Percent}%</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">Edit profile to add or update vitals.</p>
                      </CardContent>
                    </Card>
                  )}
                  {(!storedProfile.vitals || Object.keys(storedProfile.vitals || {}).length === 0) && (
                    <Card className="rounded-2xl overflow-hidden border-dashed border-border">
                      <CardContent className="pt-6 pb-6">
                        <p className="text-sm text-muted-foreground mb-2">No vitals entered yet. Add weight, BP, hemoglobin, blood sugar, heart rate, SpO₂ for a complete profile.</p>
                        <Button variant="outline" size="sm" onClick={() => setEditSheetOpen(true)} className="gap-1">
                          <Pencil className="w-3.5 h-3.5" />
                          Add vitals
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <>
                  <Card className="rounded-2xl overflow-hidden">
                    <CardContent className="pt-6 pb-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{detail!.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{detail!.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-foreground">Husband: {detail!.husbandName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-foreground">
                          {detail!.scheduledVisit} · {detail!.scheduledVisitTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl overflow-hidden">
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <UserCircle className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground">Pregnancy Status</h2>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Pregnancy {patient!.weeksPregnant} weeks
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Due Date: {detail!.dueDate}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Health Indicators card - demo profile only */}
              {!isStoredMother && detail && (
                <>
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

                  {isHighRisk && patient && (
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
                </>
              )}
            </TabsContent>

            <TabsContent value="medical" className="mt-5">
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-foreground">Medical Profile</h2>
                    {isStoredMother && storedProfile && (
                      <Button variant="outline" size="sm" onClick={() => setEditSheetOpen(true)} className="gap-1">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {isStoredMother && storedProfile ? (
                    <>
                      <p className="text-sm font-medium text-foreground mb-1">Chronic conditions</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {storedProfile.chronicConditions.length ? storedProfile.chronicConditions.join(", ") : "None"}
                        {storedProfile.otherCondition ? `; Other: ${storedProfile.otherCondition}` : ""}
                      </p>
                      <p className="text-sm font-medium text-foreground mb-1">Medication</p>
                      <p className="text-sm text-muted-foreground">
                        {storedProfile.onMedication ? storedProfile.medicationNames || "Yes (names not provided)" : "No"}
                      </p>
                    </>
                  ) : patient ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Key factors: {patient.keyFactors.join(", ")}.
                      </p>
                      <p className="text-sm text-foreground mt-2 font-medium">
                        {patient.recommendation}
                      </p>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {isStoredMother && (
              <TabsContent value="report" className="mt-5">
                <Card className="rounded-2xl overflow-hidden">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-foreground">Personal health report</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your personal health report is generated from:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
                      <li>Your profile (personal info, chronic conditions, medications, vitals you entered above)</li>
                      <li>Vitals history from Live Vitals and AI chat (when you click “Analyze my vitals”)</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mb-4">
                      The report is created by AI (Gemini) and is for guidance only — it does not replace a doctor’s advice.
                    </p>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={reportLoading}
                      className="gap-2"
                    >
                      {reportLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Generate Report
                        </>
                      )}
                    </Button>
                    {reportError && (
                      <p className="text-sm text-destructive mt-3">{reportError}</p>
                    )}
                    {reportText && (
                      <div className="mt-4">
                        <MaternalReportDisplay
                          markdown={reportText}
                          patientName={storedProfile?.name}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

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
      {isStoredMother && storedProfile && (
        <>
          <EditMotherProfileSheet
            profile={storedProfile}
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
          <AIChatbot motherProfile={storedProfile} />
        </>
      )}
    </div>
  );
};

export default MotherDashboard;
