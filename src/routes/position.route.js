import express from "express";
import { getAllPositions } from "../controllers/position.controller.js";

const router = express.Router();

router.get("/", getAllPositions);

export default router;
