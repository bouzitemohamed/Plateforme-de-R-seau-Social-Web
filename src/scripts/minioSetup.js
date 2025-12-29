const minioClient = require("../config/minio");
const envVar=require("../config/EnvVariable");
const bucketName = envVar.MINIO_BUCKET;

minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) return console.error(err);

  if (!exists) {
    minioClient.makeBucket(bucketName, '', (err) => {
      if (err) return console.error('Error creating bucket:', err);
      console.log(`Bucket "${bucketName}" created successfully`);
    });
  } else {
    console.log(`Bucket "${bucketName}" already exists`);
  }
});
