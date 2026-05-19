import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import wholesaleRouter from "./wholesale";
import discountsRouter from "./discounts";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";
import exportRouter from "./export";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(wholesaleRouter);
router.use(discountsRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(exportRouter);

export default router;
