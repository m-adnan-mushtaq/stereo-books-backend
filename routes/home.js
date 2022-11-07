const { Router } = require( "express")
const {getCategoriesHanlder,getUsersHandler,homePageDataHandler} = require( "../controllers/home.js")
const router=Router()

//------------- @index route------------------------
router.get('/',homePageDataHandler)

//get all categories list
router.get('/categories',getCategoriesHanlder)
router.get('/users',getUsersHandler)
module.exports= router