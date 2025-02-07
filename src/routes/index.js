var express = require("express");
var router = express.Router();

var adminRouter = require("./adminRouter");

var accountRouter = require("./accountRouter");

/* GET home page. */

router.use("/account", accountRouter);

router.use("/admin", adminRouter);

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
