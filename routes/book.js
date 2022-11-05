import { Router } from "express";
import {
  createBookHanldler,
  getBookAudioSignedUrl,
  getBooksHandler,
  uploadBookAudioHanlder,
  deleteBookHandler,
  findBookByIdHanldler,
} from "../controllers/book.js";
import { ensureAuth } from "../middlewares/guardRoutes.js";
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

export default router;
