import multer from "multer";

import { env } from "../config/env.js";
import { AppError } from "../lib/app-error.js";

const acceptedMimeTypes = new Set(["application/pdf", "text/plain"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_RESUME_SIZE_BYTES,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!acceptedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Only PDF and TXT resumes are accepted.", 400, "INVALID_FILE_TYPE"));
      return;
    }

    callback(null, true);
  },
});

export const resumeUploadMiddleware = upload.single("resume");
