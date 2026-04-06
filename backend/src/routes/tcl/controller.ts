import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
    getDevicesService,
    getDeviceStateService,
    reloginService,
    setDeviceStateService,
} from "./service";
import {
    getDeviceStateRequestSchema,
    setDeviceStateRequestSchema,
} from "./dto";

const router: ExpressRouter = Router();

/**
 * @openapi
 * /tcl/devices:
 *   get:
 *     summary: Get all devices
 *     tags:
 *       - TCL
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/devices", async (_, res) => {
    try {
        const response = await getDevicesService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

/**
 * @openapi
 * /tcl/device-state/{deviceId}:
 *   get:
 *     summary: Get device state
 *     tags:
 *       - TCL
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: forceRefresh
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/device-state/:deviceId", async (req, res) => {
    try {
        const validatedData = getDeviceStateRequestSchema.parse({
            ...req.params,
            ...req.query,
        });
        const response = await getDeviceStateService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

/**
 * @openapi
 * /tcl/device-state/{deviceId}:
 *   post:
 *     summary: Set device state
 *     tags:
 *       - TCL
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               properties:
 *                 type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/device-state/:deviceId", async (req, res) => {
    try {
        const validatedData = setDeviceStateRequestSchema.parse({
            ...req.params,
            ...req.body,
        });
        const response = await setDeviceStateService(validatedData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

/**
 * @openapi
 * /tcl/relogin:
 *   post:
 *     summary: Manually re-login to TCL
 *     tags:
 *       - TCL
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/relogin", async (_, res) => {
    try {
        const response = await reloginService();
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;
