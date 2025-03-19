const Role_permission = require("../models/role_permission");
const Role = require("../models/roles");


const updatePermission = async (req, res) => {
    try {
        const role = await Role.findOne({ name: req.body.role });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const rolePermissions = await Role_permission.find({ role_id: role._id })
            .populate('permission_id')
            .lean();
        if (!rolePermissions || rolePermissions.length === 0) {
            return res.status(404).json({ message: 'No permissions found for this role' });
        }

        const permissions = req.body.permissions;
        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({ message: 'Invalid permissions data' });
        }


        const updateStatusBasedOnPermissions = (array, permissions) => {
            const updates = array.map((item) => {
                const permissionName = item.permission_id.name;
                if (permissionName in permissions) {
                    return {
                        _id: item._id,
                        status: permissions[permissionName],
                    };
                }
                return null;
            }).filter(item => item !== null);

            return updates;
        };

        const updates = updateStatusBasedOnPermissions(rolePermissions, permissions);
        if (updates.length === 0) {
            return res.status(200).json({ message: 'No permissions to update' });
        }

        for (const update of updates) {
            const result = await Role_permission.updateOne(
                { _id: update._id },
                { status: update.status }
            );
        }

        res.status(200).json({
            message: 'Permissions updated successfully',
        });
    } catch (error) {
        console.error(error)
    }
};


const getPermissions = async (req, res) => {
    try {
        const role = await Role.findOne({ name: req.query.role });
        console.log(role);

        const rolePermission = await Role_permission.find({ role_id: role._id })
            .populate('permission_id', 'name')
            .select('permission_id status')
            .lean();



        const filteredPermissions = rolePermission.map(item => ({
            name: item.permission_id.name,
            status: item.status
        }));

        const permissionsObject = filteredPermissions.reduce((obj, item) => {
            obj[item.name] = item.status;
            return obj;
        }, {});

        res.json(permissionsObject)
    } catch (error) {
        console.error(error);
    }
}

module.exports = { updatePermission, getPermissions }