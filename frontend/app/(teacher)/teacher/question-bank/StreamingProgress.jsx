import { motion } from "framer-motion";

export default function StreamingProgress({
  current = 0,
  total = 0,
  message = "",
  error = false,
  stageHistory = [],
}) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ background: "#2f3542", borderRadius: 16, padding: 28 }}>
      {/* Header: spinner + status + counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}>
        <motion.div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            flexShrink: 0,
            border: `2px solid #1f1f22`,
            borderTopColor: error ? "#f87171" : "#7c6ef7",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              color: error ? "#f87171" : "#ffffff",
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 4,
            }}>
            {error ? "Generation failed" : message || "Initializing..."}
          </p>
          {!error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#7c6ef7",
                  display: "block",
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span style={{ fontSize: 13, color: "#6b6b78" }}>
                AI is working
              </span>
            </div>
          )}
        </div>
        {total > 0 && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1,
              }}>
              {current}
              <span style={{ fontSize: 15, color: "#44444f" }}> / {total}</span>
            </div>
            <div style={{ fontSize: 11, color: "#44444f", marginTop: 3 }}>
              questions
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && !error && (
        <div
          style={{
            height: 3,
            background: "#1f1f22",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 20,
          }}>
          <motion.div
            style={{ height: "100%", background: "#7c6ef7", borderRadius: 2 }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Stage history */}
      {stageHistory.length > 0 && (
        <div
          style={{
            background: "#111113",
            border: "0.5px solid #1f1f22",
            borderRadius: 10,
            padding: "14px 16px",
          }}>
          <p
            style={{
              fontSize: 10,
              color: "#44444f",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 10,
            }}>
            Progress
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stageHistory.map((stage, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#0d2010",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                  <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                    <path
                      d='M2 5l2.5 2.5L8 3'
                      stroke='#4ade80'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: "#6b6b78" }}>
                  {stage.message}
                </span>
              </motion.div>
            ))}

            {/* current active stage indicator */}
            {!error && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <motion.div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "1.5px solid #2a2a2e",
                    borderTopColor: "#7c6ef7",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span style={{ fontSize: 13, color: "#c4c4d0" }}>
                  {message || "Working..."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error detail */}
      {error && message && (
        <div
          style={{
            marginTop: 16,
            background: "#1f1010",
            border: "0.5px solid #3d1515",
            borderRadius: 10,
            padding: 14,
          }}>
          <p style={{ fontSize: 13, color: "#f87171", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
