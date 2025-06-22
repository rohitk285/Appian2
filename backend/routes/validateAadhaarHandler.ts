import { Router, Request, Response } from "express";
import {validateAadhaar} from "../controllers/validateAadhaarController.js"

const router = Router();
router.post("/", async(req: Request, res: Response) => {
    const {status, body} = await validateAadhaar(req);
    res.status(status).json(body);
});

export default router;