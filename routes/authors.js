const { Router }  =require( "express")
const router=Router()
const {listAuthorsHandler} = require( "../controllers/authors.js")
//------------- @authors/------------------------
router.get('/', listAuthorsHandler)

module.exports= router