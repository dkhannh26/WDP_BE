var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const session = require("express-session");
var indexRouter = require("./routes/index");
const setupChat = require("./routes/chat");

var app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(cors());
// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(fileUpload());
var delay = require("./middleware/delay");

app.use(
  session({
    secret: "dotai_secret_key", // Secret key để ký session ID cookie
    resave: false, // Không lưu session nếu không thay đổi
    saveUninitialized: true, // Lưu session mới ngay cả khi nó chưa được thay đổi
    cookie: {
      maxAge: 60000, // Thời gian sống của cookie (ở đây là 1 phút)
      secure: false, // Đặt thành true nếu sử dụng HTTPS
    },
  })
);

app.use("/", indexRouter);

module.exports = { app, setupChat };
