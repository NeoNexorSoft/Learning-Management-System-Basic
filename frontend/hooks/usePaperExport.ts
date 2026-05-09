"use client";

import { useCallback, useRef } from "react";
import { PaperState } from "../types/question-paper.types";
import { CREATIVE_LABELS } from "../types/question-paper.types";

export function usePaperExport(state: PaperState) {
  const printRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // Print
  // ------------------------------------------------------------------
  const handlePrint = useCallback(() => {
    const printContent = document.getElementById("paper-print-area");
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
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
    const element = document.getElementById("paper-print-area");
    if (!element) return;

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all(
        [import("jspdf"), import("html2canvas")]
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,

        onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
          // ---- Layer 1: strip all external stylesheets from the clone ----
          // This prevents Tailwind (and any other sheet using oklch/lab)
          // from being parsed by html2canvas at all.
          const clonedDocRef = clonedElement.ownerDocument;
          if (clonedDocRef) {
            // Remove <link rel="stylesheet"> tags
            clonedDocRef
              .querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")
              .forEach((link) => link.remove());

            // Remove <style> tags that contain oklch or lab references
            clonedDocRef
              .querySelectorAll<HTMLStyleElement>("style")
              .forEach((style) => {
                if (
                  style.textContent?.includes("oklch") ||
                  style.textContent?.includes("lab(") ||
                  style.textContent?.includes("--tw-")
                ) {
                  style.remove();
                }
              });

            // ---- Layer 2: inject a safe reset stylesheet ----
            const safeStyle = clonedDocRef.createElement("style");
            safeStyle.textContent = `
              *, *::before, *::after {
                color: #000000 !important;
                background-color: transparent !important;
                border-color: #000000 !important;
                box-shadow: none !important;
                text-shadow: none !important;
                -webkit-print-color-adjust: exact !important;
              }
              table, td, th, tr {
                border-color: #000000 !important;
              }
            `;
            clonedDocRef.head.appendChild(safeStyle);
          }

          // ---- Layer 3: walk every element, force inline safe colors ----
          // This is the most reliable layer — inline styles beat everything.
          const all = clonedElement.querySelectorAll<HTMLElement>("*");
          all.forEach((el) => {
            const computed = window.getComputedStyle(el);

            // Only override if the computed value is a problematic color space
            const colorVal = computed.color;
            const bgVal = computed.backgroundColor;

            const isProblematic = (v: string) =>
              v.startsWith("lab(") ||
              v.startsWith("oklch(") ||
              v.startsWith("color(") ||
              v.includes("oklch") ||
              v.includes("lab(");

            if (isProblematic(colorVal)) {
              el.style.setProperty("color", "#000000", "important");
            }

            if (isProblematic(bgVal)) {
              // Preserve explicit white backgrounds, clear everything else
              el.style.setProperty("background-color", "transparent", "important");
            }

            // Force any element that visually has a white background
            // (paper pages) to keep it
            if (
              el.getAttribute("data-paper-page") === "true" ||
              el.style.backgroundColor === "#ffffff" ||
              el.style.backgroundColor === "white"
            ) {
              el.style.setProperty("background-color", "#ffffff", "important");
            }
          });

          // The root paper element itself must be white
          clonedElement.style.setProperty(
            "background-color",
            "#ffffff",
            "important"
          );
          clonedElement.style.setProperty("color", "#000000", "important");
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
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
