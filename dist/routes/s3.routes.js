"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadphoto_middleware_1 = require("../middlewares/uploadphoto.middleware");
const s3_controller_1 = require("../controllers/s3.controller");
const router = (0, express_1.Router)();
// Test S3 configuration (no file upload required)
router.get('/test', s3_controller_1.testS3Connection);
// Upload test file
router.post('/upload', uploadphoto_middleware_1.uploadSingle, s3_controller_1.uploadTestFile);
exports.default = router;
