var express = require("express");
var router = express.Router();
const discountRoute = require('./discount');
const productRouter = require('./product');
const sizeRouter = require('./size');
const voucherRouter = require('./voucher');
var cartRouter = require("./cart");
var orderRouter = require("./order");
var paymentRouter = require("./payment");
var feedbackRouter = require("./feedback");

const statisticRouter = require("./statistic");
var accountRouter = require("./accountRouter");
var adminRouter = require("./adminRouter");
const importRouter = require("./import");
var accountRouter = require("./accountRouter");

/* GET home page. */
router.use("/order", orderRouter);
router.use("/cart", cartRouter);
router.use("/payment", paymentRouter);
router.use("/discount", discountRoute);
router.use("/product", productRouter);
router.use("/size", sizeRouter);
router.use("/account", accountRouter);
router.use("/voucher", voucherRouter)
router.use("/statistic", statisticRouter)
router.use("/feedback", feedbackRouter)
router.use("/admin", adminRouter);
router.use("/import", importRouter);
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
