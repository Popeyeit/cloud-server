const { validationResult } = require('express-validator');
const fileService = require('../service/file-service');
const ApiError = require('../exceptions/api-error');

class FileController {
  async createDir(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.notValidRequest(errors);
      }

      if (candidate) {
        throw ApiError.BadRequest(`User with email ${email} already exist`);
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
      const files = await fileService.getFiles(req.user.id, req.query.parent);
      return res.json(files);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
