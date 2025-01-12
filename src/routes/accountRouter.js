var express = require("express");
var router = express.Router();
const {
  handleLogin,
  createUser,
  handleLogout,
  forgotPassword,
  resetPassword,
  viewProfile,
  updateProfile,
  deleteProfile,
  verifyCreate,
  verifyChange,
  checkAuth,
  createCart,
  changePassword,
} = require("../controllers/accountController");

router.post("/login", handleLogin);
router.post("/check-auth", checkAuth);

router.post("/register", verifyCreate);

router.post("/register/:token", createUser);

router.post("/logout", handleLogout);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/:accountId", viewProfile);

router.put("/update/:accountId", verifyChange);
router.put("/update/:accountId/:token", updateProfile);

router.delete("/delete/:accountId", deleteProfile);

router.post("/create-cart", createCart);

router.put("/change-password/:username", changePassword);

module.exports = router;
