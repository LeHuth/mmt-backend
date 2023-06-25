import {Router} from "express";
import TagController from "./TagController";

const router = Router();

// alle tags holen
router.get("/", TagController.getAll);

export default router;