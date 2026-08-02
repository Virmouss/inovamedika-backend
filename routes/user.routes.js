const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticateToken);
// Only Admin can manage users
router.use(authorizeRoles('Admin'));

// User CRUD & Status endpoints
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/role', userController.updateRole);
router.put('/:id/status', userController.updateStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
