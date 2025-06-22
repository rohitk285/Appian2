import { Router, Request, Response } from "express";
import {getUserDetails} from "../controllers/getUserDetailsController.js"

const router = Router();

router.get("/", async(req: Request, res: Response) => {
    const {status, body} = await getUserDetails(req);
    res.status(status).json(body);
});
export default router;