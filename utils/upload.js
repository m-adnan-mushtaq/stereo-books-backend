const  client = require( "../config/s3.js")
const  {Upload} = require( "@aws-sdk/lib-storage")
const  {createReadStream} = require( "fs")
const  {unlink} = require( "fs/promises")
const  sharp = require( "sharp")
const  {PutObjectCommand} = require( "@aws-sdk/client-s3")

/**
 * function for uplaoding streams to s3 bucket
 * @param {String} path absolute or relative path to upload file stream
 * @param {String} key filename to upload
 * @param {String} encoding encoding/mimetype of file
 * @returns {Promise}
 */
async function uploadStreamToS3Helper(path,key,encoding) {
    try {
        console.log(path);
        const stream=createReadStream(path)
        const parallelUploads3 = new Upload({
            client,
            params: {
                 Bucket:process.env.S3_BUCKET_NAME, 
                 Key:key, 
                 Body:stream,
                 ContentType:encoding,
                 
                },
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5mB
          });
          parallelUploads3.on("httpUploadProgress", (progress) => {
            console.log(progress);
          });
        
          await parallelUploads3.done();
          //remove file from tempDirectory
          return unlink(path)
    } catch (error) {
        throw Error(error)
    }
}
/**
 * function for uploading files buffer to s3 bucket
 * @param {*} buffer  buffer of file to upload to s3 bucket
 * @param {*} encoding encoding/mimetype of file to upload
 * @param {*} key file key
 * @returns {Promise}
 */
async function uploadBufferToS3Helper(buffer,encoding,key){
    try {
        const command=new PutObjectCommand({
            Body:buffer,
            ContentType:encoding,
            Key:key,
            Bucket:process.env.S3_BUCKET_NAME,
        })
        return client.send(command)
    } catch (error) {
        throw Error(error)
    }
}

/**
 * functio for compress images buffer
 * @param {Buffer} buffer buffer of image to compress
 */
async function compressPic(buffer){
    try {
        return sharp(buffer).resize({
            width:300,
            height:400,
            fit:'contain',
            background:{ r: 255, g: 255, b: 255}
        }).toBuffer()
    } catch (error) {
        throw Error(error)
    }
}
module.exports=  {uploadStreamToS3Helper, uploadBufferToS3Helper,compressPic}