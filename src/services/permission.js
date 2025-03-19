const Role_account = require("../models/role_account")
const Role_permission = require("../models/role_permission");
const Role = require("../models/roles");
const Permission = require("../models/permissions");


async function getPermissionsByAccountId(accountId) {
    try {
        const roleAccount = await Role_account.findOne({ account_id: accountId });

        const rolePermissions = await Role_permission.find({ role_id: roleAccount?.role_id, status: true });

        const result = await Promise.all(
            rolePermissions.map(async (rolePermission) => {
                const foundObject = await Permission.findById(rolePermission.permission_id);
                return foundObject;
            })
        ).then(results => results.filter(obj => obj !== null));

        return result;
    } catch (error) {
        console.error("Error fetching permissions:", error);
    }
}

module.exports = { getPermissionsByAccountId }