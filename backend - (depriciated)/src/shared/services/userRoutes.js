const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkImportUsers,
  resetUserPassword
} = require('./userController');

const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { protect, authorize } = require('../middleware/auth');

// All routes below will use these middlewares
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/bulk-import')
  .post(upload.single('file'), bulkImportUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router
  .route('/:id/reset-password')
  .post(resetUserPassword);

module.exports = router;
