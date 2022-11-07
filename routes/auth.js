const { Router } = require("express")
const { logOutHanlder, refreshRouteHanlder, signInHanlder, signUpHanlder } = require("../controllers/auth.js")
const { logInLimiter, signUpLimiter } = require("../middlewares/rateLimiters.js")
const { ensureAuth } = require("../middlewares/guardRoutes.js")
const router = Router()

//------------- @sign up route------------------------
router.post('/sign-up', signUpLimiter, signUpHanlder)

//------------- @sign-in route------------------------
router.post('/sign-in', logInLimiter, signInHanlder)
//--------@refresh
router.get('/refresh', refreshRouteHanlder)

//-------- logout route--------------
router.get('/logout', ensureAuth, logOutHanlder)
module.exports= router