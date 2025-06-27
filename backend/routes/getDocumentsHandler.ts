import { Router, Request, Response } from "express";
import { getDocuments } from "../controllers/getDocumentsController.js";

const router = Router();
router.get("/", async (req: Request, res: Response) => {
    const { status, body } = await getDocuments(req);
    res.status(status).json(body);
});

export default router;