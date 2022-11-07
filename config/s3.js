const { S3Client } = require( "@aws-sdk/client-s3" )
const s3Region=process.env.S3_BUCKET_REGION
const s3Client=new S3Client({
    region:s3Region,
    credentials:{
        accessKeyId:process.env.S3_BUCKET_ACESSS_ID,
        secretAccessKey:process.env.S3_BUCKET_SECRET_KEY,
    },
})

module.exports= s3Client