import { Router } from "express";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionBank.controller";
import questionGeneratorController from "../controllers/lms-ai/generate/questions/questions.generator.controller"
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const questionBankRouter = Router();

import { Role } from "@prisma/client";

questionBankRouter.use(authenticate, requireRole(Role.TEACHER));

questionBankRouter.get("/", getQuestions);
questionBankRouter.post("/", createQuestion);
questionBankRouter.put("/:id", updateQuestion);
questionBankRouter.delete("/:id", deleteQuestion);
questionBankRouter.post("/store-generated-questions",(req,res)=>questionGeneratorController.storeQuestionsFromRAG(req,res));
questionBankRouter.post("/questions/stream", (req, res) => questionGeneratorController.streamQuestions(req, res));


export default questionBankRouter;
