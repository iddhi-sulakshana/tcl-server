import type { Express } from "express";
import healthRouter from "./health/controller";
import authRouter from "./auth/controller";
import tclRouter from "./tcl/controller";
import weatherRouter from "./weather/controller";
import { authorize } from "@/middlewares/authorize";

export function initializeRoutes(app: Express) {
    // Global API prefix
    const PREFIX = `/api/v1`;

    // Health check route
    app.use(`${PREFIX}/health`, healthRouter);

    // Auth routes
    app.use(`${PREFIX}/auth`, authRouter);

    // TCL routes
    app.use(`${PREFIX}/tcl`, authorize(), tclRouter);

    // Weather routes
    app.use(`${PREFIX}/weather`, authorize(), weatherRouter);
}
