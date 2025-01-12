require("dotenv").config();
const {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerifyCreate,
  sendChangeEmail,
} = require("../nodemailer/email");
const Account = require("../models/accounts");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Orders = require("../models/orders");

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Account.findOne({ username });
    if (user) {
      const isMatchPassword = await bcrypt.compare(password, user.password);

      if (!isMatchPassword) {
        return res.status(200).json({
          EC: 1,
          message: "Username or password is incorrect",
        });
      } else {
        // req.session.userId = username;
        // console.log(user._id);

        const payload = {
          id: user._id,
          email: user.email,
          username: username,
        };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        return res.status(200).json({
          EC: 0,
          message: "Login successful",
          token: token,
          role: user.role,
        });
      }
    } else {
      return res.status(200).json({ EC: 1, message: "Account does not exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error });
  }
};

const checkAuth = async (req, res) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];

  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ isAuthenticated: false });
    }
    return res.json({ isAuthenticated: true, user: user });
  });
};

const verifyCreate = async (req, res) => {
  const { email, username } = req.body;
  try {
    const account = await Account.findOne({ email });
    const account2 = await Account.findOne({ username });
    if (account || account2) {
      return res.status(200).json({
        success: false,
        message: "Your email or username already exist",
      });
    }

    const token = jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    // send email
    await sendVerifyCreate(
      email,
      `${process.env.CLIENT_URL}/customer/register/${token}`
    );

    res.status(200).json({
      success: true,
      message: "An email has been sent to your account",
    });
  } catch (error) {
    console.log("Error in sending email ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  const { token } = req.params;
  // console.log(token);

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const { username, email, password, phone, address, role } = decoded;

  try {
    //hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    let result = await Account.create({
      username,
      email,
      password: hashPassword,
      address,
      phone,
      role,
    });

    // await sendWelcomeEmail(email);
    return res
      .status(200)
      .json({ user: result, message: "Account created successfully", EC: 0 });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error });
  }
};

const handleLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error when logging out" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const account = await Account.findOne({ email });

    if (!account) {
      return res
        .status(200)
        .json({ success: false, message: "Your email does not exist" });
    }

    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // send email
    await sendPasswordResetEmail(
      account.email,
      `${process.env.CLIENT_URL}/customer/reset-password/${token}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { email } = decoded;

    const { password } = req.body;

    const account = await Account.findOne({ email });

    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        EC: 1,
      });
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    account.password = hashedPassword;
    await account.save();

    await sendResetSuccessEmail(account.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful", EC: 0 });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const viewProfile = async (req, res) => {
  // let id = new mongoose.Types.ObjectId(req.params.accountId);
  let username = req.params.accountId;

  try {
    const user = await Account.findOne({ username });

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
};

const deleteProfile = async (req, res) => {
  try {
    let id = req.params.accountId;
    let account = await Account.deleteById({ _id: id });
    return res.status(200).json({ account, message: "Delete successful" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: error });
  }
};

const verifyChange = async (req, res) => {
  let username = req.params.accountId;

  let { email, address, phone } = req.body;

  try {
    let check = await Account.findOne({ email });
    let user = await Account.findOne({ username });

    if (user.email === email) {
      let result = await Account.updateOne(
        { username },
        { email, phone, address }
      );

      if (result.matchedCount === 1) {
        return res
          .status(200)
          .json({ success: true, message: "Account updated successfully" });
      }
    } else {
      if (check) {
        return res.status(200).json({
          success: false,
          message: "Email already exists in our system",
        });
      } else {
        const token = jwt.sign(
          { email, address, phone },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE,
          }
        );
        // send email
        await sendChangeEmail(
          email,
          `${process.env.CLIENT_URL}/customer/update/${username}/${token}`
        );

        res.status(200).json({
          success: true,
          message: "An email has been sent to your account",
        });
      }
    }
  } catch (error) {
    console.log(error);

    return res.status(404).json({ success: false, message: error });
  }
};

const updateProfile = async (req, res) => {
  const { token, accountId } = req.params;
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const { email, phone, address } = decoded;
  // console.log(accountId, token, decoded);

  try {
    let result = await Account.updateOne(
      { username: accountId },
      { email, phone, address }
    );

    if (result.matchedCount === 1) {
      return res
        .status(200)
        .json({ EC: 0, message: "Account updated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ EC: 1, message: error });
  }
};

const createCart = async (req, res) => {
  try {
    let order = await Orders.create(req.body);
    return res.status(200).json({ EC: 0, message: "ok", order });
  } catch (error) {
    console.log(error);
  }
};

const changePassword = async (req, res) => {
  let username = req.params.username;
  let { oldPassword, newPassword } = req.body;

  try {
    let user = await Account.findOne({ username });
    const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
    if (isMatchPassword) {
      const hashPassword = await bcrypt.hash(newPassword, saltRounds);
      await Account.updateOne({ username }, { password: hashPassword });
      return res
        .status(200)
        .json({ success: true, message: "Change password successfully" });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Old password is incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleLogin,
  checkAuth,
  createUser,
  handleLogout,
  forgotPassword,
  resetPassword,
  viewProfile,
  updateProfile,
  deleteProfile,
  verifyCreate,
  verifyChange,
  createCart,
  changePassword,
};
