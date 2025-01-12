const express = require("express");
const {
  getStatistic,
  exportExcel,
} = require("../controllers/statistic.controller");
const statisticRouter = express.Router();

statisticRouter.post("/export", exportExcel);

statisticRouter.get("/:year", getStatistic);

module.exports = statisticRouter;
