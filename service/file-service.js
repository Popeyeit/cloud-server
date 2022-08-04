const fs = require("fs");
const path = require("path");
const FileModel = require("../models/file-model");
const UserModel = require("../models/user-model");

const FileService = class FileService {
  async createDir(file) {
    const filePath = path.resolve("files", file.user.toString(), file.path);

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
      return filePath;
    } else {
      throw ApiError.BadRequest("File already exist");
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

  async uploadFile(req, file) {
    const parent = await FileModel.findOne({
      user: req.user.id,
      _id: req.body.parent,
    });
    const user = await UserModel.findOne({ _id: req.user.id });
    if (user.usedSpace + file.size > user.diskSpace) {
      throw ApiError.BadRequest("There no space on the disk");
    }
    user.usedSpace = user.usedSpace + file.size;

    let createdFilePath;
    if (parent) {
      createdFilePath = path.resolve(
        "files",
        user._id.toString(),
        parent.path,
        file.name
      );
    } else {
      createdFilePath = path.resolve("files", user._id.toString(), file.name);
    }
    if (fs.existsSync(createdFilePath)) {
      throw ApiError.BadRequest("File already exist");
    }
    file.mv(createdFilePath);
    const type = file.name.split(".").pop();
    let filePath = file.name;
    if (parent) {
      filePath = parent.path + "\\" + file.name;
    }
    const dbFile = new FileModel({
      name: file.name,
      type,
      size: file.size,
      path: filePath,
      parent: parent?._id,
      user: user._id,
    });

    await dbFile.save();
    await user.save();
    return dbFile;
  }

  async downloadFile(req) {
    const file = await FileModel.findOne({
      _id: req.query.id,
      user: req.user.id,
    });

    const createdPath = path.resolve(
      "files",
      req.user.id.toString(),
      file.path
    );
    if (fs.existsSync(createdPath)) {
      return { createdPath, file };
    }
    throw ApiError.BadRequest("Download error");
  }

  async deleteFile(fileId, userId) {
    //TODO: Implement ability to remove whole directory
    const file = await FileModel.findOne({
      _id: fileId,
      user: userId,
    });

    if (!file) {
      throw ApiError.BadRequest("File not found");
    }
    const path = this.getPath(file);
    if (file.type === "dir") {
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
    await file.remove();
  }

  getPath(file) {
    return path.resolve("files", file.user.toString(), file.path);
  }
};

module.exports = new FileService();
