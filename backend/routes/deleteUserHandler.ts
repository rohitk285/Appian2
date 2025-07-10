import {Router, Request, Response} from "express";
import {deleteUser} from "../controllers/deleteUserController.js";

const router = Router();
router.get("/", async(req: Request, res: Response) => {
    const {status, body} = await deleteUser(req);
    res.status(status).json(body);
});

export default router;