const express = require('express');
const {
  getPermissions,
  getRolePermissions,
  grantPermissionToRole,
  revokePermissionFromRole,
  getPermissionsSummary,
  createPermission
} = require('./permissionsController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes below require authentication and admin access
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Permission management routes
router.route('/')
  .get(getPermissions)
  .post(createPermission);

router.route('/summary')
  .get(getPermissionsSummary);

router.route('/roles/:role')
  .get(getRolePermissions);

router.route('/roles/:role/grant')
  .post(grantPermissionToRole);

router.route('/roles/:role/revoke')
  .delete(revokePermissionFromRole);

module.exports = router;
