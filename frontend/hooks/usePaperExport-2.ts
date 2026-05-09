"use client";

import { useCallback, useRef } from "react";
import {CREATIVE_LABELS, PaperState} from "@/types/question-paper.types";

export function usePaperExport(state: PaperState) {
  const printRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // Print: open the browser print dialog scoped to the preview element
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
  // PDF download via jsPDF + html2canvas
  // Uses the same DOM that the preview renders
  // ------------------------------------------------------------------
    const handleDownloadPDF = useCallback(async () => {
        const element = document.getElementById("paper-print-area");
        if (!element) return;

        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import("jspdf"),
                import("html2canvas"),
            ]);

            // html2canvas cannot parse oklch/lab colors from Tailwind CSS v4 or modern CSS.
            // We snapshot all computed colors to hex/rgb before capture, then restore them.
            const allElements = element.querySelectorAll<HTMLElement>("*");
            const originalStyles: { el: HTMLElement; color: string; bg: string }[] = [];

            allElements.forEach((el) => {
                const computed = window.getComputedStyle(el);
                const color = computed.color;
                const bg = computed.backgroundColor;

                // Only override if the value contains a function html2canvas cannot handle
                if (color.startsWith("lab") || color.startsWith("oklch") || color.startsWith("color(")) {
                    originalStyles.push({ el, color: el.style.color, bg: el.style.backgroundColor });
                    el.style.color = "#000000";
                }
                if (bg.startsWith("lab") || bg.startsWith("oklch") || bg.startsWith("color(")) {
                    if (!originalStyles.find((s) => s.el === el)) {
                        originalStyles.push({ el, color: el.style.color, bg: el.style.backgroundColor });
                    }
                    el.style.backgroundColor = "transparent";
                }
            });

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                // Tell html2canvas to ignore CSS variables it cannot resolve
                onclone: (clonedDoc) => {
                    const style = clonedDoc.createElement("style");
                    style.textContent = `
          * {
            color: revert !important;
            background-color: revert !important;
          }
          [data-pdf-safe] {
            color: inherit;
            background-color: inherit;
          }
        `;
                    // We don't inject this - instead we use ignoreElements below
                },
            });

            // Restore original styles
            originalStyles.forEach(({ el, color, bg }) => {
                el.style.color = color;
                el.style.backgroundColor = bg;
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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
  // Word download: build a basic HTML document that Word can open
  // This avoids server-side dependency while keeping the layout readable
  // ------------------------------------------------------------------
  const handleDownloadWord = useCallback(() => {
    const { info, mcqSection, creativeQuestions } = state;

    const hasMCQ = ["mcq", "mcq_creative", "mcq_short_creative"].includes(info.examType);
    const hasCreative = ["creative", "mcq_creative", "short_creative", "mcq_short_creative"].includes(info.examType);

    let body = "";

    // Header
    body += `
      <div style="text-align:center; margin-bottom:12pt;">
        <h2 style="font-size:20pt; margin:0;">${info.boardName}-${info.year}</h2>
        <h3 style="font-size:14pt; margin:4pt 0;">${info.subjectNameBn}</h3>
      </div>
    `;

    // MCQ section
    if (hasMCQ && mcqSection.questions.length > 0) {
      body += `<h4 style="text-align:center;">${info.subjectNameBn} (বহুনির্বাচনি অভীক্ষা)</h4>`;
      body += `<p><strong>বিষয় কোড:</strong> ${info.subjectCode} &nbsp;&nbsp; <strong>সময়:</strong> ${info.mcqTime} &nbsp;&nbsp; <strong>পূর্ণমান:</strong> ${info.mcqFullMarks}</p>`;

      mcqSection.questions.forEach((q) => {
        body += `<p><strong>${q.serial}.</strong> ${q.text}</p>`;
        body += `<table><tr>`;
        q.options.forEach((o) => {
          body += `<td style="padding:0 12pt;">${o.label}. ${o.text}</td>`;
        });
        body += `</tr></table>`;
      });
    }

    // Creative section
    if (hasCreative && creativeQuestions.length > 0) {
      body += `<br/><h4 style="text-align:center;">${info.subjectNameBn} (তত্ত্বীয়-সৃজনশীল)</h4>`;
      body += `<p><strong>সময়:</strong> ${info.creativeTime} &nbsp;&nbsp; <strong>পূর্ণমান:</strong> ${info.creativeFullMarks}</p>`;

      creativeQuestions.forEach((q) => {
        body += `<p><strong>${q.serial}|</strong> <em>উদ্দীপক:</em> ${q.stimulus}</p>`;
        q.subQuestions.forEach((sq) => {
          body += `<p style="margin-left:20pt;">${CREATIVE_LABELS[sq.label]}. ${sq.text} &nbsp;<strong>${sq.marks}</strong></p>`;
        });
      });
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${info.subjectNameBn} প্রশ্নপত্র</title>
        </head>
        <body style="font-family:'SutonnyMJ', 'Noto Serif Bengali', serif; font-size:11pt; line-height:1.6;">
          ${body}
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${info.subjectNameBn}_${info.boardName}_${info.year}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  return {
    printRef,
    handlePrint,
    handleDownloadPDF,
    handleDownloadWord,
  };
}
