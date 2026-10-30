import { Router, type IRouter } from "express";
import healthRouter from "./health";
import koreanNewsRouter from "./korean-news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(koreanNewsRouter);

export default router;
