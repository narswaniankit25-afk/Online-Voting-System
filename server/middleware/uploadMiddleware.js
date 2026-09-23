const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
    __dirname,
    "../uploads/candidates"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const fileName =
            `candidate-${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}${extension}`;

        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, PNG and WEBP images are allowed"
            )
        );
    }
};

const upload = multer({
    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;