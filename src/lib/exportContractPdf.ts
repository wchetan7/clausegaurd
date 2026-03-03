import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ContractData {
  name: string;
  vendor: string;
  risk_score: string | null;
  contract_value: number | null;
  renewal_date: string | null;
  notice_period_days: number | null;
  auto_renewal: boolean | null;
  status: string | null;
  created_at: string;
}

interface ClauseData {
  clause_type: string;
  severity: string;
  summary: string;
  raw_text: string;
  action_required: string | null;
}

export function exportContractPdf(contract: ContractData, clauses: ClauseData[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ── Title ──
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Contract Analysis Report", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Generated on ${format(new Date(), "MMMM d, yyyy")}`, pageWidth / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 14;

  // ── Contract details ──
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(contract.name, 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const details = [
    ["Vendor", contract.vendor],
    ["Risk Score", contract.risk_score || "N/A"],
    ["Contract Value", `$${(contract.contract_value || 0).toLocaleString()}/yr`],
    ["Renewal Date", contract.renewal_date ? format(new Date(contract.renewal_date), "MMM d, yyyy") : "N/A"],
    ["Notice Period", contract.notice_period_days ? `${contract.notice_period_days} days` : "N/A"],
    ["Auto-Renewal", contract.auto_renewal ? "Yes" : "No"],
    ["Status", contract.status || "N/A"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Field", "Value"]],
    body: details,
    theme: "striped",
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Clauses ──
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Extracted Clauses", 14, y);
  y += 4;

  if (clauses.length === 0) {
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("No clauses were extracted for this contract.", 14, y);
  } else {
    const sortedClauses = [...clauses].sort((a, b) => {
      const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

    const clauseRows = sortedClauses.map((c) => [
      c.clause_type,
      c.severity,
      c.summary,
      c.action_required || "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Clause", "Severity", "Summary", "Action Required"]],
      body: clauseRows,
      theme: "striped",
      headStyles: { fillColor: [30, 30, 30], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 22 },
        2: { cellWidth: 80 },
        3: { cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const severity = data.cell.raw as string;
          if (severity === "HIGH") data.cell.styles.textColor = [220, 38, 38];
          else if (severity === "MEDIUM") data.cell.styles.textColor = [202, 138, 4];
          else data.cell.styles.textColor = [22, 163, 74];
        }
      },
    });
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `ClauseGuard — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const safeName = contract.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeName}_Report.pdf`);
}
