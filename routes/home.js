import { Router } from "express";
import {getCategoriesHanlder,getUsersHandler,homePageDataHandler} from "../controllers/home.js"
const router=Router()

//------------- @index route------------------------
router.get('/',homePageDataHandler)

//get all categories list
router.get('/categories',getCategoriesHanlder)
router.get('/users',getUsersHandler)
export default router