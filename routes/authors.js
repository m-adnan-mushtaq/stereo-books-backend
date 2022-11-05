import { Router } from "express";
const router=Router()
import {listAuthorsHandler} from "../controllers/authors.js"
//------------- @authors/------------------------
router.get('/', listAuthorsHandler)

export default router