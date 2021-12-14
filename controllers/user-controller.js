const User = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userService = require('../service/user-service');

class UserController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Incorrect request', errors });
      }
      const { email, password } = req.body;
      const userData = await userService.registration(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(201).json(userData);
    } catch (error) {
      console.log(error);
    }
  }
  async login(req, res) {
    try {
    } catch (error) {}
  }

  async logout(req, res) {
    try {
    } catch (error) {}
  }
  async activate(req, res) {
    try {
    } catch (error) {}
  }
  async refresh(req, res) {
    try {
    } catch (error) {}
  }
}

module.exports = new UserController();
