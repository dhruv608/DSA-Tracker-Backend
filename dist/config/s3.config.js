"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_REGION = exports.S3_BUCKET_NAME = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});
exports.S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
exports.AWS_REGION = process.env.AWS_REGION;
