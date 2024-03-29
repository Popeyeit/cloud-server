const Router = require("express");
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/auth-middleware");
const fileControllers = require("../controllers/file-controller");

const router = new Router();

router.post(
  "",
  [check("name", "field can not be empty").isLength({ min: 1 })],
  authMiddleware,
  fileControllers.createDir
);

router.post("/upload", authMiddleware, fileControllers.uploadFile);
router.post("/avatar", authMiddleware, fileControllers.uploadAvatar);
router.get("", authMiddleware, fileControllers.getFiles);
router.delete("/", authMiddleware, fileControllers.deleteFile);
router.delete("/avatar", authMiddleware, fileControllers.deleteAvatar);
router.get("/download", authMiddleware, fileControllers.downloadFile);
router.get("/search", authMiddleware, fileControllers.searchFile);

module.exports = router;
