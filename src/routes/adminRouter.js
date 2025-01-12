var express = require("express");
const {
  getAccountList,
  createStaffAccount,
  deleteAccount,
  updateAccount,
  getAccount,
  accountRecovery,
  permanentlyDelete,
  handleLogin,
} = require("../controllers/adminController");
var router = express.Router();

router.get("/account/list", getAccountList);

router.post("/account/create", createStaffAccount);

router.delete("/account/:accountId", deleteAccount);

router.put("/account/:accountId", updateAccount);

router.get("/account/:accountId", getAccount);

router.post("/account/recovery/:accountId", accountRecovery);

router.delete("/account/permanentlyDelete/:accountId", permanentlyDelete);

router.post("/login", handleLogin);

module.exports = router;
