const { validationResult } = require("express-validator");
const fileService = require("../service/file-service");
const ApiError = require("../exceptions/api-error");

class FileController {
  async createDir(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.notValidRequest(errors);
      }

      const { name, type, parent } = req.body;
      const user = req.user;
      const file = await fileService.createDirDb(name, type, parent, user);
      res.json(file);
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req, res, next) {
    try {
      const { sort } = req.query;
      const files = await fileService.getFiles(
        req.user.id,
        req.query.parent,
        sort
      );
      return res.json(files);
    } catch (error) {
      next(error);
    }
  }

  async uploadFile(req, res, next) {
    try {
      const file = req.files.file;
      const dbFile = await fileService.uploadFile(req, file);
      res.json(dbFile);
    } catch (error) {
      next(error);
    }
  }

  async downloadFile(req, res, next) {
    try {
      const dbFile = await fileService.downloadFile(req);
      const { createdPath: path, file } = dbFile;
      return res.download(path, file.name);
    } catch (e) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const fileId = req.query.id;
      const userId = req.user.id;
      await fileService.deleteFile(fileId, userId);
      res.json({ message: "File was deleted" });
    } catch (error) {
      next(error);
    }
  }

  async searchFile(req, res, next) {
    try {
      const searchName = req.query.search;
      const files = await fileService.searchFile(req.user.id, searchName);
      return res.json(files);
    } catch (e) {
      next(e);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const file = req.files.file;
      const user = await fileService.uploadAvatar(req.user.id, file);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async deleteAvatar(req, res, next) {
    try {
      const user = await fileService.deleteAvatar(req.user.id);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new FileController();
