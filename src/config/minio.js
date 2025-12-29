const Minio = require('minio');
const envVar = require('./EnvVariable'); // your env variables

const minioClient = new Minio.Client({
  endPoint: envVar.MINIO_ENDPOINT,
  port: parseInt(envVar.MINIO_PORT),
  useSSL: false, // true if you use https
  accessKey: envVar.MINIO_ROOT_USER,
  secretKey: envVar.MINIO_ROOT_PASSWORD
});

module.exports = minioClient;
