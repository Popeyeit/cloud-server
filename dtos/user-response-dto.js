module.exports = class UserDto {
  email;
  isActivated;
  diskSpace;
  usedSpace;
  avatar;

  constructor(model) {
    this.email = model.email;
    this.isActivated = model.isActivated;
    this.diskSpace = model.diskSpace;
    this.usedSpace = model.usedSpace;
    this.avatar = model.avatar;
  }
};
