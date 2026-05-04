import dynamic from "next/dynamic";

const SecurePDFViewer = dynamic(() => import("./SecurePDFViewerClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "300px",
        background: "#111114",
        borderRadius: "10px",
        border: "1px solid #222228",
        color: "#6b6b78",
        fontFamily: "ui-monospace, monospace",
        fontSize: "14px",
      }}
    >
      Loading PDF viewer...
    </div>
  ),
});

export default SecurePDFViewer;