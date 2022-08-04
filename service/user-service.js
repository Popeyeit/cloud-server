const UserModel = require("../models/user-model");
const FileModel = require("../models/file-model");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const fileService = require("./file-service");
const UserDto = require("../dtos/user-dto");
const UserResponseDto = require("../dtos/user-response-dto");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} already exist`);
    }
    const hashPassword = await bcrypt.hash(password, 4);
    const activationLink = uuid.v4();
    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
    });

    await fileService.createDir(new FileModel({ user: user.id, name: "" }));

    // await mailService.sendActivationMail(
    //   email,
    //   `${process.env.API_URL}/api/auth/activate/${activationLink}`,
    // );

    const userDto = new UserDto(user);
    const userResponseDto = new UserResponseDto(user);

    // TODO: maybe delete user data after registration.
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userResponseDto,
    };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Not correct link");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("User is not found");
    }
    if (!user.isActivated) {
      throw ApiError.BadRequest("User is not activated");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Password is not correct");
    }
    const userDto = new UserDto(user);
    const userResponseDto = new UserResponseDto(user);

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userResponseDto,
    };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);

    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const userResponseDto = new UserResponseDto(user);

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userResponseDto,
    };
  }

  async getAllUsers() {
    const users = UserModel.find();
    return users;
  }
}

module.exports = new UserService();
