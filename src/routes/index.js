var express = require("express");
var router = express.Router();

var accountRouter = require("./accountRouter");

var accountRouter = require("./accountRouter");

/* GET home page. */

router.use("/account", accountRouter);

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
