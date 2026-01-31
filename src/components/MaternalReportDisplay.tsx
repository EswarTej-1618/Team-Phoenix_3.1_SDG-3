import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Printer } from "lucide-react";
import { markdownReportToHtml, wrapReportAsDocument } from "@/lib/reportFormat";
import { cn } from "@/lib/utils";

interface MaternalReportDisplayProps {
  markdown: string;
  patientName?: string;
  className?: string;
}

const reportStyles = `
.report-title { font-size: 1.125rem; font-weight: 700; color: hsl(var(--foreground)); margin: 1.25rem 0 0.5rem; padding-bottom: 0.35rem; border-bottom: 2px solid hsl(var(--border)); }
.report-title:first-child { margin-top: 0; }
.report-label-line, .report-para { margin: 0.35rem 0; font-size: 0.9375rem; line-height: 1.6; color: hsl(var(--foreground)); }
.report-list { margin: 0.5rem 0 0.75rem 1.25rem; padding-left: 1.25rem; }
.report-list li { margin: 0.2rem 0; font-size: 0.9375rem; line-height: 1.5; }
.report-spacer { height: 0.65rem; }
.report-body strong { font-weight: 600; color: hsl(var(--foreground)); }
`;

export function MaternalReportDisplay({
  markdown,
  patientName = "Maternal Health Report",
  className,
}: MaternalReportDisplayProps) {
  const htmlContent = markdownReportToHtml(markdown);
  const docTitle = `Maternal Health Report${patientName ? `: ${patientName}` : ""}`;

  const handleDownload = () => {
    const fullHtml = wrapReportAsDocument(htmlContent, docTitle);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SafeMOM-Report-${(patientName ?? "Report").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const fullHtml = wrapReportAsDocument(htmlContent, docTitle);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <style>{reportStyles}</style>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download report
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </Button>
      </div>
      <ScrollArea className="rounded-xl border border-border bg-card max-h-[60vh]">
        <div
          className="report-body p-5 text-foreground"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </ScrollArea>
    </div>
  );
}
