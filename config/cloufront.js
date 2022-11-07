const {CloudFrontClient} = require('@aws-sdk/client-cloudfront')


const cloudfrontClient=new CloudFrontClient({
    region:process.env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.S3_BUCKET_ACESSS_ID,
        secretAccessKey: process.env.S3_BUCKET_SECRET_KEY,
    },
    
});
module.exports= cloudfrontClient;