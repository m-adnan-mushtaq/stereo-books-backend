const  { Router } = require( "express")
const  {
  createBookHanldler,
  getBookAudioSignedUrl,
  getBooksHandler,
  uploadBookAudioHanlder,
  deleteBookHandler,
  findBookByIdHanldler,
} = require( "../controllers/book.js")
const  { ensureAuth } = require( "../middlewares/guardRoutes.js")
const router = Router();

//------------- @books/ route------------------------
router
  .route("/")
  .get(getBooksHandler)
  //upload book route
  .post(ensureAuth, createBookHanldler);

//------------- @books/upload--------------------------
router.post("/upload", ensureAuth, uploadBookAudioHanlder);
//------------- @books/audio--------------------------
router.get("/audio", ensureAuth, getBookAudioSignedUrl);

//------------- @books/:id route------------------------
router
  .route("/:id")
  .get(findBookByIdHanldler)
  .delete(ensureAuth, deleteBookHandler);


module.exports=  router;
