const Notification = require('../models/notification_chat');

class NotificationChatController {
    async unread(req, res, next) {
        try {
            const notifications = await Notification.find({
                recipientId: req.params.userId,
                read: false
            }).sort({ timestamp: -1 });
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async read(req, res, next) {
        try {
            await Notification.updateMany(
                { recipientId: req.params.userId, senderId: req.params.senderId, read: false },
                { $set: { read: true } }
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = new NotificationChatController

