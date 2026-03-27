const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'super_admin', 'cashier'), getUsers);
router.post('/', authorize('admin', 'super_admin'), createUser);

router
  .route('/:id')
  .get(authorize('admin', 'super_admin', 'cashier'), getUser)
  .put(authorize('admin', 'super_admin'), updateUser)
  .delete(authorize('admin', 'super_admin'), deleteUser);

module.exports = router;
