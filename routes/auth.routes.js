const Router = require('express');
const { check } = require('express-validator');
const userControllers = require('../controllers/user-controller');

const router = new Router();

router.post('/registration', [
  check('email', 'Incorrect email').isEmail(),
  check(
    'password',
    'Password must be longer than 3 and shorter than 12',
  ).isLength({ min: 3, max: 12 }),
  userControllers.registration,
]);

router.post('/login', userControllers.login);
router.post('/logout', userControllers.logout);
router.get('/activate/:link', userControllers.activate);
router.get('/refresh', userControllers.refresh);

module.exports = router;
