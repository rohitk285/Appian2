import { Router, Request, Response } from "express";
import {getLinks} from "../controllers/getLinksController.js"

const router = Router();
router.get("/", async(req: Request, res: Response) => {
    const {status, body} = await getLinks(req);
    res.status(status).json(body);
});

export default router;