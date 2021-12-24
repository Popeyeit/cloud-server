const fs = require('fs');
const path = require('path');
const FileModel = require('../models/file-model');

const FileService = class FileService {
  async createDir(file) {
    const filePath = path.resolve('files', file.user.toString(), file.path);

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
      return filePath;
    } else {
      throw ApiError.BadRequest('File already exist');
    }
  }

  async createDirDb(name, type, parent, user) {
    const file = new FileModel({ name, type, parent, user: user.id });

    const parentFile = parent && (await FileModel.findById(parent));

    if (!parentFile) {
      file.path = name;
      await this.createDir(file);
    } else {
      file.path = path.join(parentFile.path, file.name);
      await this.createDir(file);
      parentFile.children.push(file._id);
      await parentFile.save();
    }
    await file.save();
    return file;
  }

  async getFiles(user, parent) {
    const files = await FileModel.find({ user, parent });

    return files;
  }
};

module.exports = new FileService();
