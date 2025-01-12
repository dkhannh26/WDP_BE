const express = require("express");
const {
  createImportDetail,
  listImport,
  getDetailImport,
  deleteImport,
  confirmImport,
} = require("../controllers/import.controller");
const router = express.Router();

router.post("/createDetail", createImportDetail);

router.get("/list", listImport);

router.get("/:id", getDetailImport);

router.delete("/:id", deleteImport);

router.put("/:id", confirmImport);

module.exports = router;
