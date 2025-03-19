const express = require('express');
const { updatePermission, getPermissions } = require('../controllers/permission.controller');
const permissionRouter = express.Router()

permissionRouter.put('/', updatePermission)
permissionRouter.get('/', getPermissions)



module.exports = permissionRouter;