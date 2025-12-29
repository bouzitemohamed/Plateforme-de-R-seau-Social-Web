require("dotenv").config();
const envVar={
    PORT:process.env.PORT,
    MONGODB_URI:process.env.MONGODB_URI,
    ACCESS_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET,
    MINIO_ENDPOINT:process.env.MINIO_ENDPOINT,
    MINIO_PORT:process.env.MINIO_PORT,
    MINIO_ROOT_USER:process.env.MINIO_ROOT_USER,
    MINIO_ROOT_PASSWORD:process.env.MINIO_ROOT_PASSWORD,
    MINIO_BUCKET:process.env.MINIO_BUCKET
};
module.exports=envVar;