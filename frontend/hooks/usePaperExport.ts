"use client";

import { useCallback, useRef } from "react";
import { PaperState } from "../types/question-paper.types";
import { CREATIVE_LABELS } from "../types/question-paper.types";

export function usePaperExport(state: PaperState) {
  const printRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // Print
  // ------------------------------------------------------------------
  // const handlePrint = useCallback(() => {
  //   const printContent = document.getElementById("paper-print-area");
  //   if (!printContent) return;
  //
  //   const originalContents = document.body.innerHTML;
  //   document.body.innerHTML = printContent.innerHTML;
  //   window.print();
  //   document.body.innerHTML = originalContents;
  //   window.location.reload();
  // }, []);
    const handlePrint = useCallback(() => {
        const printContent = document.getElementById("paper-print-area");
        if (!printContent) return;

        // Clone the element so we can strip problematic attributes
        // without touching the live DOM
        const cloned = printContent.cloneNode(true) as HTMLElement;

        // Walk every element in the clone and convert any inline style
        // that might reference CSS variables or oklch into safe hex values.
        // Our preview pages already use hex inline styles, so this is a
        // safety net for any wrapper-level Tailwind classes.
        cloned.querySelectorAll<HTMLElement>("*").forEach((el) => {
            // Remove className entirely — no Tailwind in print window
            el.removeAttribute("class");
        });
        cloned.removeAttribute("class");

        // Only Google Fonts — no Tailwind, no app CSS
        const fontLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap" />`;

        const printHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>প্রশ্নপত্র</title>
  ${fontLink}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Noto Serif Bengali', 'Noto Serif', Georgia, serif;
    }

    /* Wrapper between pages */
    #paper-print-area {
      display: block;
      background: #ffffff;
    }

    /* Each page wrapper — force A4 page break */
    #paper-print-area > div {
      display: block;
      box-shadow: none;
      border-radius: 0;
      background: #ffffff;
      page-break-after: always;
      break-after: page;
    }

    #paper-print-area > div:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* The actual content pages (MCQPreviewPage etc.) are already
       794px wide with inline styles. Scale them to fit A4. */
    #paper-print-area > div > div {
      transform-origin: top left;
      transform: scale(1.0); /* 794px * 0.757 ≈ 210mm at 96dpi */
      width: 794px;
    }
  </style>
</head>
<body>
  ${cloned.outerHTML}
  <script>
    // fonts সহ সব load হওয়ার পরে print করো
    window.addEventListener('load', function () {
      // document.fonts.ready ensures @font-face fonts are loaded
      document.fonts.ready.then(function () {
        window.print();
        window.addEventListener('afterprint', function () {
          window.close();
        });
      });
    });
  <\/script>
</body>
</html>`;

        const printWindow = window.open("", "_blank", "width=900,height=700");

        if (!printWindow) {
            alert("পপআপ ব্লক হয়েছে। ব্রাউজারের পপআপ permission দিন এবং আবার চেষ্টা করুন।");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
    }, []);

  // ------------------------------------------------------------------
  // PDF download
  //
  // Root cause of the "lab" error:
  // html2canvas reads *computed* CSS values from the browser (including
  // values inherited from Tailwind's design tokens / CSS custom properties
  // like --tw-color-* which resolve to oklch/lab). Its internal color
  // parser cannot handle those modern color spaces and throws.
  //
  // Fix strategy — three layers applied inside onclone():
  //   1. Inject a <style> that hard-resets every element's color and
  //      background-color to safe hex values using !important, before
  //      html2canvas touches any computed style.
  //   2. Walk every cloned element and force color/background-color as
  //      inline style (overrides anything the stylesheet could cascade).
  //   3. Remove every <link rel="stylesheet"> and <style> tag whose
  //      content is not ours, so Tailwind's oklch tokens never load
  //      inside the clone document at all.
  // ------------------------------------------------------------------
    const handleDownloadPDF = useCallback(async () => {
        // Each paper page is captured individually so layout never distorts.
        // The gap/shadow wrapper divs between pages are skipped.
        const pages = document.querySelectorAll<HTMLElement>("[data-paper-page='true']");

        // Filter to only actual page content divs (not the wrapper itself)
        // The wrapper also has data-paper-page="true", so we take children only
        const printArea = document.getElementById("paper-print-area");
        if (!printArea) return;

        // Direct children of paper-print-area are the per-page wrapper divs
        const pageWrappers = Array.from(
            printArea.children
        ) as HTMLElement[];

        if (pageWrappers.length === 0) return;

        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import("jspdf"),
                import("html2canvas"),
            ]);

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const A4_WIDTH_MM = 210;
            const A4_HEIGHT_MM = 297;

            // Shared onclone handler — strips oklch/lab from every captured page
            const safeonClone = (_doc: Document, el: HTMLElement) => {
                const docRef = el.ownerDocument;
                if (!docRef) return;

                // Strip Tailwind and any oklch-bearing stylesheets
                docRef
                    .querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")
                    .forEach((l) => l.remove());

                docRef.querySelectorAll<HTMLStyleElement>("style").forEach((s) => {
                    if (
                        s.textContent?.includes("oklch") ||
                        s.textContent?.includes("lab(") ||
                        s.textContent?.includes("--tw-")
                    ) {
                        s.remove();
                    }
                });

                // Inject safe color reset
                const safe = docRef.createElement("style");
                safe.textContent = `
        *, *::before, *::after {
          color: #000000 !important;
          background-color: transparent !important;
          border-color: #000000 !important;
          box-shadow: none !important;
        }
        table, td, th, tr { border-color: #000000 !important; }
      `;
                docRef.head.appendChild(safe);

                // Force inline safe colors on every element
                el.querySelectorAll<HTMLElement>("*").forEach((child) => {
                    const cs = window.getComputedStyle(child);
                    const bad = (v: string) =>
                        v.includes("oklch") || v.includes("lab(") || v.includes("color(");

                    if (bad(cs.color)) child.style.setProperty("color", "#000000", "important");
                    if (bad(cs.backgroundColor)) {
                        child.style.setProperty("background-color", "transparent", "important");
                    }
                    // Preserve explicit white backgrounds (the paper itself)
                    if (
                        child.style.backgroundColor === "#ffffff" ||
                        child.style.backgroundColor === "white" ||
                        child.getAttribute("data-paper-page") === "true"
                    ) {
                        child.style.setProperty("background-color", "#ffffff", "important");
                    }
                });

                el.style.setProperty("background-color", "#ffffff", "important");
                el.style.setProperty("color", "#000000", "important");
            };

            for (let i = 0; i < pageWrappers.length; i++) {
                const wrapper = pageWrappers[i];

                // The actual content div is the first child of the wrapper
                // (wrapper = shadow/border div, child = MCQPreviewPage/CreativePage etc.)
                const contentEl = (wrapper.firstElementChild as HTMLElement) ?? wrapper;

                const canvas = await html2canvas(contentEl, {
                    scale: 1.5,           // reduced from 2 — good quality, smaller file
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                    // Fix: tell html2canvas the exact pixel size to capture
                    width: contentEl.scrollWidth,
                    height: contentEl.scrollHeight,
                    windowWidth: contentEl.scrollWidth,
                    onclone: safeonClone,
                });

                // Convert to JPEG at 92% quality — 60-70% smaller than PNG
                const imgData = canvas.toDataURL("image/jpeg", 0.92);

                // Scale image to fill A4 exactly, maintaining aspect ratio
                const canvasAspect = canvas.height / canvas.width;
                const imgHeightMM = A4_WIDTH_MM * canvasAspect;

                if (i > 0) pdf.addPage();

                if (imgHeightMM <= A4_HEIGHT_MM) {
                    // Content fits in one page — center vertically
                    const topOffset = (A4_HEIGHT_MM - imgHeightMM) / 2;
                    pdf.addImage(imgData, "JPEG", 0, topOffset, A4_WIDTH_MM, imgHeightMM);
                } else {
                    // Content taller than A4 — slice across multiple PDF pages
                    let remaining = imgHeightMM;
                    let yOffset = 0;

                    while (remaining > 0) {
                        pdf.addImage(imgData, "JPEG", 0, -yOffset, A4_WIDTH_MM, imgHeightMM);
                        remaining -= A4_HEIGHT_MM;
                        yOffset += A4_HEIGHT_MM;
                        if (remaining > 0) pdf.addPage();
                    }
                }
            }

            const filename = `${state.info.subjectNameBn}_${state.info.boardName}_${state.info.year}.pdf`;
            pdf.save(filename);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("PDF তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
    }, [state.info]);

  // ------------------------------------------------------------------
  // Word download
  // ------------------------------------------------------------------
  const handleDownloadWord = useCallback(() => {
    const { info, mcqSection, creativeQuestions } = state;

    const hasMCQ =
      info.examType === "mcq" ||
      info.examType === "mcq_creative" ||
      info.examType === "mcq_short_creative";

    const hasCreative =
      info.examType === "creative" ||
      info.examType === "mcq_creative" ||
      info.examType === "mcq_short_creative" ||
      info.examType === "short_creative";

    const headerHtml = `
      <table width="100%" style="border-collapse:collapse; margin-bottom:8pt;">
        <tr>
          <td width="60pt" style="vertical-align:top;">
            <div style="background:#1a1a2e;color:white;padding:4pt;font-size:7pt;text-align:center;width:52pt;height:52pt;">
              বোর্ড প্রশ্ন ও উত্তরমালা ${info.year}
            </div>
          </td>
          <td style="text-align:right;vertical-align:bottom;">
            <span style="font-size:26pt;font-weight:bold;">${info.subjectNameBn}</span>
          </td>
        </tr>
      </table>
      <div style="text-align:center;font-size:14pt;font-weight:bold;margin-bottom:4pt;">
        ${info.boardName}-${info.year}
      </div>
    `;

    let mcqHtml = "";
    if (hasMCQ && mcqSection.questions.length > 0) {
      const left = mcqSection.questions.filter((_, i) => i % 2 === 0);
      const right = mcqSection.questions.filter((_, i) => i % 2 === 1);

      const renderQs = (qs: typeof mcqSection.questions) =>
        qs
          .map(
            (q) => `
          <p style="margin:0 0 3pt 0;font-size:8pt;">
            <b>${q.serial}.</b> ${q.text}
          </p>
          <table width="100%" style="border-collapse:collapse;font-size:7.5pt;margin-bottom:5pt;">
            <tr>
              <td width="50%">${q.options[0]?.label}. ${q.options[0]?.text}</td>
              <td width="50%">${q.options[1]?.label}. ${q.options[1]?.text}</td>
            </tr>
            <tr>
              <td>${q.options[2]?.label}. ${q.options[2]?.text}</td>
              <td>${q.options[3]?.label}. ${q.options[3]?.text}</td>
            </tr>
          </table>
        `
          )
          .join("");

      mcqHtml = `
        <div style="page-break-after:always;">
          ${headerHtml}
          <table width="100%" style="border-collapse:collapse;font-size:8.5pt;margin-bottom:4pt;">
            <tr>
              <td><b>${info.subjectNameBn} (বহুনির্বাচনি অভীক্ষা)</b></td>
              <td style="text-align:right;">বিষয় কোড ${info.subjectCode}</td>
            </tr>
            <tr>
              <td>সময় : ${info.mcqTime}</td>
              <td style="text-align:right;">পূর্ণমান : ${info.mcqFullMarks}</td>
            </tr>
          </table>
          <div style="border:1pt solid black;padding:3pt;font-size:7.5pt;margin-bottom:6pt;">
            <b>[বিশেষ দ্রষ্টব্য : </b>${info.mcqInstruction}<b> প্রতিটি প্রশ্নের মান ১]</b>
          </div>
          <table width="100%" style="border-collapse:collapse;">
            <tr>
              <td width="49%" style="vertical-align:top;padding-right:6pt;border-right:0.5pt solid #999;">
                ${renderQs(left)}
              </td>
              <td width="2%"></td>
              <td width="49%" style="vertical-align:top;padding-left:6pt;">
                ${renderQs(right)}
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    let creativeHtml = "";
    if (hasCreative && creativeQuestions.length > 0) {
      const mid = Math.ceil(creativeQuestions.length / 2);

      const renderCreative = (qs: typeof creativeQuestions) =>
        qs
          .map(
            (q) => `
          <p style="margin:0 0 3pt 0;font-size:8.5pt;">
            <b>${q.serial}|</b> ${q.stimulus}
          </p>
          ${q.subQuestions
            .map(
              (sq) => `
            <table width="100%" style="border-collapse:collapse;font-size:8pt;">
              <tr>
                <td><b>${CREATIVE_LABELS[sq.label]}.</b> ${sq.text}</td>
                <td width="16pt" style="text-align:right;"><b>${sq.marks}</b></td>
              </tr>
            </table>
          `
            )
            .join("")}
          <br/>
        `
          )
          .join("");

      creativeHtml = `
        <div>
          ${headerHtml}
          <table width="100%" style="border-collapse:collapse;font-size:8.5pt;margin-bottom:4pt;">
            <tr>
              <td><b>${info.subjectNameBn} (তত্ত্বীয়-সৃজনশীল)</b></td>
              <td style="text-align:right;">বিষয় কোড ${info.subjectCode}</td>
            </tr>
            <tr>
              <td>সময় : ${info.creativeTime}</td>
              <td style="text-align:right;">পূর্ণমান : ${info.creativeFullMarks}</td>
            </tr>
          </table>
          <div style="border-top:1pt solid black;border-bottom:1pt solid black;padding:3pt;font-size:7.5pt;margin-bottom:6pt;">
            <b>[দ্রষ্টব্য : </b>${info.creativeInstruction}<b> যেকোনো পাঁচটি প্রশ্নের উত্তর দিতে হবে।]</b>
          </div>
          <table width="100%" style="border-collapse:collapse;">
            <tr>
              <td width="49%" style="vertical-align:top;padding-right:6pt;border-right:0.5pt solid #999;">
                ${renderCreative(creativeQuestions.slice(0, mid))}
              </td>
              <td width="2%"></td>
              <td width="49%" style="vertical-align:top;padding-left:6pt;">
                ${renderCreative(creativeQuestions.slice(mid))}
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${info.subjectNameBn} প্রশ্নপত্র</title>
          <style>
            body {
              font-family: 'Noto Serif Bengali', 'Vrinda', serif;
              font-size: 11pt;
              line-height: 1.5;
              margin: 54pt 72pt;
            }
          </style>
        </head>
        <body>
          ${mcqHtml}
          ${creativeHtml}
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${info.subjectNameBn}_${info.boardName}_${info.year}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  return {
    printRef,
    handlePrint,
    handleDownloadPDF,
    handleDownloadWord,
  };
}
