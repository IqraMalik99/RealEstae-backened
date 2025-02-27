import { Router } from "express";
import { auth } from "../middlerware/auth.middleware.js";
import { upload } from "../middlerware/multer.js";
import { createList, DeleteList, FullList, getList, rentList, saleList, ShowList, updataData, UpdateList } from "../controllers/listController.js";

export let listRoute= Router();
listRoute.route('/create').post(auth, upload.array("imageUrl",10),createList);
listRoute.route('/show').get(auth,ShowList);
listRoute.route('/:id').get(auth,FullList);
listRoute.route('/delete/:id').post(DeleteList);
listRoute.route('/update/:id').post(auth,UpdateList);
listRoute.route('/updataData').post(auth,upload.array("updateImage",10),updataData);
listRoute.route('/getsalelist/:page').get(saleList);
listRoute.route('/getrentlist/:page').get(rentList)
