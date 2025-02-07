var express = require("express");
var router = express.Router();
const discountRoute = require("./discount");
const productRouter = require("./product");
const sizeRouter = require("./size");
const voucherRouter = require("./voucher");
var cartRouter = require("./cart");
// var orderRouter = require("./order");
var paymentRouter = require("./payment");
var feedbackRouter = require("./feedback");

var adminRouter = require("./adminRouter");

var accountRouter = require("./accountRouter");

/* GET home page. */

// router.use("/order", orderRouter);
router.use("/cart", cartRouter);
router.use("/payment", paymentRouter);
router.use("/discount", discountRoute);
router.use("/product", productRouter);
router.use("/size", sizeRouter);
router.use("/account", accountRouter);

router.use("/admin", adminRouter);

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
