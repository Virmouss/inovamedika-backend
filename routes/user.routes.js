const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);
// Only Admin can manage users
router.use(authorizeRoles('Admin'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id/role', userController.updateRole);

module.exports = router;
