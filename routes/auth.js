import { Router } from "express";
import { logOutHanlder, refreshRouteHanlder, signInHanlder, signUpHanlder } from "../controllers/auth.js";
import { logInLimiter, signUpLimiter } from "../middlewares/rateLimiters.js";
import {ensureAuth} from "../middlewares/guardRoutes.js"
const router=Router()

//------------- @sign up route------------------------
router.post('/sign-up',signUpLimiter ,  signUpHanlder)

//------------- @sign-in route------------------------
router.post('/sign-in',logInLimiter, signInHanlder)
//--------@refresh
router.get('/refresh',refreshRouteHanlder)

//-------- logout route--------------
router.get('/logout', ensureAuth,logOutHanlder)
export default router