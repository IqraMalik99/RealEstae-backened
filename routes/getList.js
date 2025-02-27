import { Router } from "express";
import {  getList } from "../controllers/listController.js";

export let listGetRouter= Router()
listGetRouter.route('/all').get(getList);