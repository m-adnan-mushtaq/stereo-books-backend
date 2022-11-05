import multer from "multer"
import crypto from "node:crypto"
import {tmpdir} from "node:os"
import { extname } from "node:path"

const diskStorage=multer.diskStorage({
    destination:tmpdir(),
    filename:generateFileName
})

const bufferStorage=multer.memoryStorage()

const uploadAudioInstance=multer({
    storage:diskStorage,
    fileFilter:function(req,file,cb) {
        const audioAllowedTypes=/mp4|mp3|wav|ogg|mpeg/
        return fileValidatorHelper(file,cb,audioAllowedTypes)
    },
    limits:{
        files:1,
        fileSize:150*1024*1024 //150mb,
    }
}).fields([
    {
        name:'bookAudio',
        maxCount:1
    }
])


const uploadBufferPicInstance=multer({
    storage:bufferStorage,
    fileFilter:function(req,file,cb) {
        const allowedTypes=/jpeg|jpg|png/
        return fileValidatorHelper(file,cb,allowedTypes)
    },
    limits:{
        files:1,
        fileSize:4*1024*1024 //4mb,
    }
}).single('coverPic')


/**
 * function for generating unique name for file to avoid replacing files with same names
 * @param {String} originalname original name of file.ext
 * @returns {String} unique name.ext
 */
function generateKeyHelper(originalname) {
    return crypto.randomBytes(32).toString('hex')+extname(originalname)
}

function generateFileName(req,file,cb){
    let updatedName= generateKeyHelper(file.originalname)
    cb(null,updatedName)
}


/**
 * function for handling unqiue names of files
 * @param {Object} file  file to upload
 * @param {Function} cb  cb for execeptions
 * @param {RegExp} regex regex of allowed file types
 */
function fileValidatorHelper(file,cb,regex) {
    const checkFileType= regex.test(extname(file.originalname))
    const checkMimeType= regex.test(file.mimetype)
    if (checkFileType && checkMimeType) cb(null,file)
    else cb(new Error('File format is invalid, try using audio formats!'))
}

export {uploadAudioInstance,uploadBufferPicInstance,generateKeyHelper};