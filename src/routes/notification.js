var express = require("express");
var router = express.Router();

module.exports = (io) => {
  const { sendNotification, getListNotification, readNotifications } =
    require("../controllers/notification.controller")(io);

  router.post("/send-notification/:feedbackId", sendNotification);
  router.get("/get-notification/:accountId", getListNotification);

  router.put("/read-notification/:accountId", readNotifications);

  return router;
};
