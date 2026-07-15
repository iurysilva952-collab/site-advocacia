import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import lawyersRouter from "./lawyers";
import clientsRouter from "./clients";
import casesRouter from "./cases";
import blogRouter from "./blog";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/lawyers", lawyersRouter);
router.use("/clients", clientsRouter);
router.use("/cases", casesRouter);
router.use("/blog", blogRouter);
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
