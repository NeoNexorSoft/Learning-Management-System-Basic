import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import settingsRoutes from "./routes/settings.routes";
import {
  courseRouter,
  teacherRouter,
  adminRouter,
  categoryRouter,
  sectionRouter,
  lessonRouter,
} from "./routes/course.routes";
import {
  enrollmentRouter,
  lessonProgressRouter,
  enrolledStudentsRouter,
  reviewRouter,
} from "./routes/enrollment.routes";
import {
  assignmentRouter,
  submissionRouter,
  lessonAssignmentRouter,
} from "./routes/assignment.routes";
import { certificateRouter } from "./routes/certificate.routes";
import uploadRoutes from "./routes/upload.routes";
import { notificationRouter } from "./routes/notification.routes";
import {
  withdrawalRouter,
  adminWithdrawalRouter,
} from "./routes/withdrawal.routes";
import {
  teacherTransactionRouter,
  adminPaymentRouter,
} from "./routes/transaction.routes";

const app = express();

app.use(helmet());

// In development allow any localhost origin so port variations (3000, 3001…) never trigger CORS blocks
const allowedOrigin =
  env.NODE_ENV === "development"
    ? (
        origin: string | undefined,
        cb: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
          cb(null, true);
        } else {
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      }
    : env.CLIENT_URL;

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/teacher", teacherTransactionRouter); // GET /api/teacher/transactions

// Admin routes
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/withdrawals", adminWithdrawalRouter); // GET/PUT /api/admin/withdrawals/:id
app.use("/api/admin", adminRouter);
app.use("/api/admin", adminPaymentRouter); // GET /api/admin/payments

app.use("/api/categories", categoryRouter);
app.use("/api/sections", sectionRouter);

// /api/lessons — three routers share this prefix (no method/path conflicts)
app.use("/api/lessons", lessonRouter);
app.use("/api/lessons", lessonProgressRouter);
app.use("/api/lessons", lessonAssignmentRouter);

// /api/courses — additional routers share this prefix (two-segment paths, no collision with /:slug)
app.use("/api/courses", enrolledStudentsRouter);
app.use("/api/courses", reviewRouter);

app.use("/api/enrollments", enrollmentRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/withdrawals", withdrawalRouter); // POST /api/withdrawals, GET /api/withdrawals/my
app.use("/api/certificates", certificateRouter);
app.use("/api/notifications", notificationRouter); // GET /my, PATCH /read-all, PATCH /:id/read
app.use("/api/upload", uploadRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(
  (
    err: Error & { statusCode?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const statusCode = err.statusCode ?? 500;
    const message =
      statusCode === 500 && env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;

    res.status(statusCode).json({ status: "error", message });
  },
);

export default app;
