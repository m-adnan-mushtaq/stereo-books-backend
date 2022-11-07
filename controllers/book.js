const { getSignedUrl } = require("@aws-sdk/cloudfront-signer")
const {
  generateKeyHelper,
  uploadAudioInstance,
  uploadBufferPicInstance,
} = require("../config/multer.js");
const Book = require("../models/Book.js");
const {
  compressPic,
  uploadBufferToS3Helper,
  uploadStreamToS3Helper,
} = require("../utils/upload.js");
const { readFileSync } = require("fs");
const { DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.js");
const { CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");
const cloudfrontClient = require("../config/cloufront.js");
const { isValidObjectId, Types } = require("mongoose");
const { authorPopulatOptions } = require("../utils/utils.js");

//function for getting books
async function getBooksHandler(req, res) {
  try {
    let offSet = 4;
    let currentPage = req.query.page || 1;
    currentPage = parseInt(currentPage)
    let queryObj = {};
    let paginationSetup = {};
    let { search, author, category } = req.query;
    //search by title and summary if provided
    if (search && search !== "") {
      queryObj = {
        ...queryObj,
        $or: [
          {
            title: new RegExp(search.trim(), "igm"),
          },
          {
            summary: new RegExp(search.trim(), "igm"),
          },
        ],
      };
    }

    //filter by author and books
    if (author && author?.length) {
      queryObj["author"] = { $in: author }
    }
    //filter by category
    if (category && category !== "") {
      queryObj["category"] = new RegExp(category.trim(), 'igm');
    }
    //get total count of books
    const totalBooks = await Book.count(queryObj).exec();

    let startIndex = offSet * (currentPage - 1);
    let totalPages = Math.ceil(totalBooks / offSet);

    if (currentPage < totalPages) {
      paginationSetup.next = currentPage + 1;

    }
    if (currentPage > 1) {
      paginationSetup.prev = currentPage - 1;
    }
    //find books
    const foundBooks = await Book.find(queryObj).populate(authorPopulatOptions).limit(offSet).skip(startIndex);
    // console.log(queryObj);
    res.json({
      totalBooks,
      currentPage,
      totalPages,
      ...paginationSetup,
      foundBooks,
    });
  } catch (error) {
    res.status(500).json({
      error: error?.message,
    });
  }
}

//save book to database and upload cover pic to s3 bucket
function createBookHanldler(req, res) {
  return uploadBufferPicInstance(req, res, async (err) => {
    try {
      //create book

      const { title, summary, audioFileKey, category } = req.body;
      if (!title || !summary || !audioFileKey || !category)
        throw Error("Invalid Credentials");
      let file = req.file;
      // console.log(req.file);
      // console.log(req.body);
      if (!file) throw Error("File not found!");

      //upload compressPic
      let buffer = await compressPic(file.buffer);
      let key = `bookCovers/${generateKeyHelper(file.originalname)}`;
      let encoding = file.mimetype;
      let response = await uploadBufferToS3Helper(buffer, encoding, key);
      //check if it was succesfully uploaded
      if (!response.$metadata && response.$metadata.httpStatusCode != 200)
        throw Error("failed to upload cover pic");

      const book = await Book.create({
        title,
        summary,
        fileKey: audioFileKey,
        category,
        author: req.user._id,
        coverPicUrl: `https://d1vy2u3rjahyt8.cloudfront.net/${key}`,
      });
      res.status(201).json({
        id: book._id
      });
    } catch (error) {
      console.error(error);
      res.status(403).json({
        error: error.message,
      });
    }
  });
}

//find specific book by id

async function findBookByIdHanldler(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw Error("Invalid book id: " + id);
    const book = await Book.findById(id).populate(authorPopulatOptions).orFail(
      new Error("No Book found with id " + id)
    );

    const randomBooks = await findRandomBooks(id)
    res.status(200).json({
      book, randomBooks
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
}




// upload audio files to s3 bucket
function uploadBookAudioHanlder(req, res) {
  return uploadAudioInstance(req, res, async (err) => {
    try {
      if (err) throw Error(err);
      //upload book handler
      console.log(req.files);
      let file = req.files["bookAudio"][0];
      if (!file) throw Error("No File Found");

      //get file credentials
      let { filename: key, mimetype: encoding, path } = file;
      if (!key || !encoding || !path) throw Error("Invalid Credentials!");
      key = `bookAudios/${key}`;
      console.log(key);
      await uploadStreamToS3Helper(path, key, encoding);
      res.status(201).json({
        key,
      });
    } catch (error) {
      console.error(error);
      res.status(403).json({
        error: error.message,
      });
    }
  });
}

// get signedUrl for book audio  only for logged in users
function getBookAudioSignedUrl(req, res) {
  try {
    //get signedUrl for specific fileKey
    const { fileKey } = req.query;
    if (!fileKey) throw Error("No File Key found!");
    //read privateRSAPrivateKey
    const privateKey = readFileSync("./rsa.private", "ascii");

    let originalUrl = `${process.env.CLOUDFRONT_ORIGIN_URL}/${fileKey}`;
    // console.log(process.env.CLOUDFRONT_KEY_PAIR_ID);
    let signedUrl = getSignedUrl({
      url: originalUrl,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
      privateKey,
      dateLessThan: new Date(Date.now() + 3600 * 1000 * 24), //invalid signed url after 1 day
    });
    res.json({
      signedUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(504).json({
      error: error.message,
    });
  }
}

//delete book , remove cover pic and audio file, invalid cache of cloudfront
async function deleteBookHandler(req, res) {
  try {
    let foundBook = await Book.findById(req.params.id).orFail(
      "No Such Book found"
    );
    //extract keys
    let { fileKey: audioFileKey, coverPicUrl, author } = foundBook;
    if (!author.toString() === req.user._id.toString())
      throw Error("Not have permission to delete this resources!");
    let coverFileKey = "bookCovers" + coverPicUrl.split("bookCovers")[1];
    if (!coverFileKey) throw Error("Invalid audio  file key found!")
    // console.log(audioFileKey);
    // console.log(coverFileKey);
    //delete cover pic and audioPic
    let command = new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
        Objects: [
          {
            Key: audioFileKey,
          },
          {
            Key: coverFileKey,
          },
        ],
        Quiet: false,
      },
    });
    let deleteResponse = await s3Client.send(command);
    // console.log(deleteResponse);
    //invalidate cache = require( cloudfront
    const invalidationCommand = new CreateInvalidationCommand({
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: audioFileKey,
        Paths: {
          Quantity: 1,
          Items: ["/" + audioFileKey],
        },
      },
    });
    let response = await cloudfrontClient.send(invalidationCommand);
    // console.log(response);
    //delete book
    await Book.deleteOne({ _id: req.params.id });
    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(403).json({
      error: error.message,
    });
  }
}

module.exports = {
  createBookHanldler,
  uploadBookAudioHanlder,
  getBookAudioSignedUrl,
  deleteBookHandler,
  findBookByIdHanldler,
  getBooksHandler
};


//common utils functions
function findRandomBooks(currentId) {
  return Book.aggregate([
    {
      $match: {
        _id: {
          $ne: Types.ObjectId(currentId)
        }
      }
    },
    {
      $sample: { size: 3 }
    },
    {
      $lookup: {
        localField: 'author',
        foreignField: '_id',
        from: 'users',
        as: 'author',
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: '$author'
    }
  ])
}