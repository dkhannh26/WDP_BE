require("dotenv").config();
const nodemailer = require("nodemailer");
const {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL,
  VERIFY_CREATE_ACCOUNT,
  VERIFY_CHANGE_EMAIL,
} = require("./emailTemplate.js");

// const sendWelcomeEmail = async (email) => {
//   const recipient = [{ email }];

//   try {
//     const response = await mailtrapClient.send({
//       from: sender,
//       to: recipient,

//       subject: "Welcome email",
//       html: WELCOME_EMAIL,
//       category: "Welcome email",
//     });

//     console.log("Welcome email sent successfully", response);
//   } catch (error) {
//     console.error(`Error sending welcome email`, error);

//     throw new Error(`Error sending welcome email: ${error}`);
//   }
// };

const sendVerifyCreate = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"Dotai 👻" <dotaiverify@gmail.com>',
      to: email,
      subject: "Verify your email",
      html: VERIFY_CREATE_ACCOUNT.replace("{resetURL}", resetURL),
    });
    console.log("Email has been sent to your account ", info);
  } catch (error) {
    console.error(`Error creating account`, error);

    throw new Error(`Error creating account: ${error}`);
  }
};

const sendChangeEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"Dotai 👻" <dotaiverify@gmail.com>',
      to: email,
      subject: "Verify change your email",
      html: VERIFY_CHANGE_EMAIL.replace("{resetURL}", resetURL),
    });
    console.log("Email has been sent to your account ", info);
  } catch (error) {
    console.error(`Error changing email`, error);

    throw new Error(`Error changing email: ${error}`);
  }
};

const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"Dotai 👻" <dotaiverify@gmail.com>',
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    console.log("Password reset email sent successfully", info);
  } catch (error) {
    console.error(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"Dotai 👻" <dotaiverify@gmail.com>',
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", info);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
module.exports = {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerifyCreate,
  sendChangeEmail,
};
