import { recordStore } from "../recordStore.js";

export class PdfGenerator {
    static printRecord(record) {
        const proj = recordStore.getProjectInfo();
        const printWindow = window.open("", "_blank", "width=960,height=1100");
        const statusClass = (record.status || "Open").toLowerCase().replace(/[\s&]+/g, "-");
        const docId = `CMWARE-${record.number}-${Date.now()}`;

        const markup = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${record.number} — Transmittal</title>
<style>
  @page { size: letter; margin: 0.6in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #fff; font-size: 13px; line-height: 1.5; }

  /* ── Letterhead ── */
  .lh { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a5f; padding-bottom: 14px; margin-bottom: 18px; }
  .lh-brand { font-size: 22px; font-weight: 800; color: #1e3a5f; letter-spacing: 0.5px; }
  .lh-brand span { display: block; font-size: 11px; font-weight: 400; color: #64748b; margin-top: 3px; }
  .lh-right { text-align: right; }
  .doc-num { font-size: 28px; font-weight: 800; color: #0f172a; }
  .status-stamp {
    display: inline-block; padding: 4px 14px; border-radius: 4px;
    font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 6px;
  }
  .status-open { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; }
  .status-closed,.status-approved { background: #dcfce7; color: #166534; border: 1px solid #22c55e; }
  .status-in-review,.status-submitted { background: #e0f2fe; color: #075985; border: 1px solid #38bdf8; }
  .status-revise-and-resubmit,.status-pricing { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
  .status-approved-as-noted { background: #eff6ff; color: #1d4ed8; border: 1px solid #3b82f6; }

  /* ── Meta Grid ── */
  .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 18px; }
  .meta-item label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
  .meta-item span { font-weight: 600; color: #0f172a; }

  /* ── Sections ── */
  .sec { border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 14px; overflow: hidden; }
  .sec-head { background: #f1f5f9; padding: 7px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; border-bottom: 1px solid #cbd5e1; }
  .sec-body { padding: 12px 14px; white-space: pre-wrap; }
  .sec-official .sec-head { background: #eff6ff; color: #1e40af; }
  .sec-official { border-color: #93c5fd; }

  /* ── Attachments ── */
  .att-list { list-style: none; display: grid; gap: 4px; }
  .att-list li { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .att-list li::before { content: "📎"; font-size: 12px; }

  /* ── DocuSign Signature Block ── */
  .sig-section { margin-top: 32px; border-top: 2px dashed #94a3b8; padding-top: 20px; }
  .sig-section h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 16px; }
  .sig-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .sig-box {
    border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px;
    background: #f8fafc; position: relative;
  }
  .sig-box .sig-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; display: block; }
  .sig-anchor {
    display: flex; align-items: center; justify-content: center;
    height: 52px; border: 2px dashed #3b82f6; border-radius: 4px;
    background: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px; cursor: pointer; margin-bottom: 8px;
    position: relative;
  }
  .sig-anchor::after { content: "✦ CLICK TO SIGN"; }
  /* DocuSign standard anchor tags (invisible in print, but machine-readable) */
  .ds-anchor { position: absolute; opacity: 0; font-size: 1px; color: transparent; user-select: none; }
  .sig-name-line { border-top: 1px solid #64748b; padding-top: 6px; font-size: 11px; color: #475569; }
  .sig-name-line strong { display: block; }
  .sig-date-area { display: flex; gap: 8px; align-items: center; margin-top: 8px; font-size: 11px; color: #475569; }
  .sig-date-box { border-bottom: 1px solid #64748b; flex: 1; min-height: 20px; }

  /* DocuSign envelope metadata strip */
  .ds-meta { margin-top: 18px; background: #1e3a5f; color: white; border-radius: 6px; padding: 10px 14px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; }
  .ds-meta span { opacity: 0.8; }
  .ds-badge { background: rgba(255,255,255,0.2); border-radius: 4px; padding: 2px 8px; font-weight: 700; font-size: 10px; }

  .footer { margin-top: 18px; text-align: center; font-size: 10px; color: #94a3b8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sig-anchor { border: 2px dashed #3b82f6 !important; background: #eff6ff !important; }
  }
</style>
</head>
<body>

<!-- Letterhead -->
<div class="lh">
  <div>
    <div class="lh-brand">
      ${proj.name || "Riverside Medical Center"}
      <span>Project #${proj.number || "PRJ-2026-04"} &bull; ${proj.address || "Chicago, IL"}</span>
      <span>GC: ${proj.generalContractor || "Apex Construction"} &bull; Architect: ${proj.architect || "Design Studio International"}</span>
    </div>
  </div>
  <div class="lh-right">
    <div class="doc-num">${record.number}</div>
    <div class="status-stamp status-${statusClass}">${record.status || "OPEN"}</div>
    <div style="font-size:10px;color:#64748b;margin-top:6px;">Transmittal Date: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
  </div>
</div>

<!-- Metadata -->
<div class="meta">
  <div class="meta-item"><label>Subject / Title</label><span>${record.title}</span></div>
  <div class="meta-item"><label>Ball In Court / Assignee</label><span>${record.ballInCourt || record.assignedTo || "Design Team"}</span></div>
  <div class="meta-item"><label>CSI Spec Section</label><span>${record.specSection || "N/A"}</span></div>
  <div class="meta-item"><label>Drawing Reference</label><span>${record.drawingNumber || "N/A"}</span></div>
  <div class="meta-item"><label>Date Created</label><span>${record.createdAt || "—"}</span></div>
  <div class="meta-item"><label>Due Date</label><span>${record.due || "Unscheduled"}</span></div>
  <div class="meta-item"><label>Cost Impact</label><span>${record.costImpact || "$0"}</span></div>
  <div class="meta-item"><label>Schedule Impact</label><span>${record.scheduleImpact || "0 Days"}</span></div>
  ${record.type ? `<div class="meta-item"><label>Submittal Type</label><span>${record.type}</span></div>` : ""}
  ${record.manufacturer ? `<div class="meta-item"><label>Manufacturer</label><span>${record.manufacturer}</span></div>` : ""}
  ${record.reason ? `<div class="meta-item"><label>Reason for Change</label><span>${record.reason}</span></div>` : ""}
</div>

<!-- RFI Q&A or General Scope -->
${record.module === "rfis" || record.question ? `
  <div class="sec">
    <div class="sec-head">Question / Problem Statement</div>
    <div class="sec-body">${record.question || record.description || "No question provided."}</div>
  </div>
  ${record.suggestion ? `
  <div class="sec">
    <div class="sec-head">General Contractor Recommendation / Suggestion</div>
    <div class="sec-body">${record.suggestion}</div>
  </div>` : ""}
  <div class="sec sec-official">
    <div class="sec-head">Official Architect / Engineer Response</div>
    <div class="sec-body">${record.officialAnswer || "Formal Architect/Engineer response pending."}</div>
  </div>
` : `
  <div class="sec">
    <div class="sec-head">Scope & Description</div>
    <div class="sec-body">${record.description || record.question || "No scope description provided."}</div>
  </div>
`}

<!-- Attachments -->
${record.attachments?.length ? `
<div class="sec">
  <div class="sec-head">Transmittal File Attachments</div>
  <div class="sec-body">
    <ul class="att-list">
      ${record.attachments.map((f) => `<li>${f}</li>`).join("")}
    </ul>
  </div>
</div>` : ""}

<!-- DocuSign-Compatible Signature Block -->
<div class="sig-section">
  <h4>Electronic Signatures — DocuSign Certified Transmittal</h4>
  <div class="sig-grid">
    <!-- Signer 1: Submitter -->
    <div class="sig-box">
      <span class="sig-label">Submitted By — ${record.assignedCompany || "Apex Construction"}</span>
      <div class="sig-anchor">
        <!-- DocuSign anchor tags -->
        <span class="ds-anchor">/sig1/</span>
        <span class="ds-anchor">/sn1/</span>
      </div>
      <div class="sig-name-line">
        <strong id="signer1-name">${record.assignedTo || "Project Manager"}</strong>
        <span>${record.assignedCompany || "General Contractor"}</span>
      </div>
      <div class="sig-date-area">
        Date: <div class="sig-date-box">
          <span class="ds-anchor">/d1/</span>
        </div>
      </div>
    </div>

    <!-- Signer 2: Reviewing Authority -->
    <div class="sig-box">
      <span class="sig-label">Reviewed By — ${record.ballInCourt?.split("(")[1]?.replace(")", "") || "Design Studio International"}</span>
      <div class="sig-anchor">
        <!-- DocuSign anchor tags -->
        <span class="ds-anchor">/sig2/</span>
        <span class="ds-anchor">/sn2/</span>
      </div>
      <div class="sig-name-line">
        <strong id="signer2-name">${record.ballInCourt?.split("(")[0]?.trim() || "Lead Architect"}</strong>
        <span>Reviewing Authority / Architect of Record</span>
      </div>
      <div class="sig-date-area">
        Date: <div class="sig-date-box">
          <span class="ds-anchor">/d2/</span>
        </div>
      </div>
    </div>
  </div>

  <!-- DocuSign Envelope Verification Strip -->
  <div class="ds-meta">
    <div>
      <div style="font-weight:700;margin-bottom:2px;">DocuSign Envelope ID</div>
      <span>${docId}</span>
    </div>
    <div style="text-align:right;">
      <div class="ds-badge">cmware • Powered by DocuSign</div>
      <span style="display:block;margin-top:4px;">Anchor Tags: /sig1/ /sig2/ /d1/ /d2/ /sn1/ /sn2/</span>
    </div>
  </div>
</div>

<div class="footer">
  This document was generated by cmware — Commercial Construction Project Controls Platform.
  Document ID: ${docId} &bull; ${new Date().toISOString()}
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

        printWindow.document.open();
        printWindow.document.write(markup);
        printWindow.document.close();
    }
}
