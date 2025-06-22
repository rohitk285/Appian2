import { Router, Request, Response } from "express";
import { handlePushDetails } from "../controllers/pushDetailsController.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { status, body } = await handlePushDetails(req);
  res.status(status).json(body);
});

export default router; 
