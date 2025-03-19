const express = require("express");
const {
  getStatistic,
  exportExcel,
  getRatingDetail,
} = require("../controllers/statistic.controller");
const statisticRouter = express.Router();

statisticRouter.post("/export", exportExcel);
statisticRouter.get("/rating-detail/:year", getRatingDetail);
statisticRouter.get("/:year", getStatistic);

module.exports = statisticRouter;
