import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import wholesaleRouter from "./wholesale";
import discountsRouter from "./discounts";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";
import exportRouter from "./export";
import customersRouter from "./customers";

const router: IRouter = Router();

// NOTE: honeypot routes are mounted BEFORE this router in app.ts
// to intercept scanner traffic early.
router.use(healthRouter);
router.use(productsRouter);
router.use(wholesaleRouter);
router.use(discountsRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(exportRouter);
router.use("/customers", customersRouter);

export default router;
