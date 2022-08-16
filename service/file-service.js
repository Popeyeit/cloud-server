const fs = require("fs");
const path = require("path");
const ApiError = require("../exceptions/api-error");
const FileModel = require("../models/file-model");
const UserModel = require("../models/user-model");
const Uuid = require("uuid");

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

  async getFiles(user, parent, sort) {
    switch (sort) {
      case "name":
        return await FileModel.find({ user, parent }).sort({ name: 1 });
      case "type":
        return await FileModel.find({ user, parent }).sort({ type: 1 });
      case "date":
        return await FileModel.find({ user, parent }).sort({ date: -1 });
      default:
        return await FileModel.find({ user, parent });
    }
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

  async searchFile(user, searchName) {
    let files = await FileModel.find({ user });
    files = files.filter((file) => file.name.includes(searchName));
    return files;
  }

  async uploadAvatar(userId, file) {
    const user = await UserModel.findById(userId);
    const avatarName = Uuid.v4() + ".jpg";
    const createdFilePath = path.resolve("static", avatarName);
    file.mv(createdFilePath);
    user.avatar = avatarName;
    await user.save();

    return user;
  }

  async deleteAvatar(userId) {
    const user = await UserModel.findById(userId);
    fs.unlinkSync(path.resolve("static", user.avatar));
    user.avatar = null;
    await user.save();

    return user;
  }
};

module.exports = new FileService();
