var express = require("express");
var router = express.Router();

const { getSearchList } = require("../controllers/product.controller");
const { getProductList,
  getProductDetail,
  uploadProductImg,
  updateProduct,
  addProduct,
  deleteProduct
} = require("../controllers/product/product.controller");

router.put("/:id", updateProduct);
router.get("/:id", getProductDetail);
router.get("/", getProductList);
router.get('/search/:text', getSearchList)
router.post("/upload/:id", uploadProductImg);
router.post("/", addProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
