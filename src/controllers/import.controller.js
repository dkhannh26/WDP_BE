require("dotenv").config();
const Import_detail = require("../models/import_details");
const Imports = require("../models/imports");
const Pants = require("../models/pants");
const Tshirts = require("../models/tshirts");
const Shoes = require("../models/shoes");
const Accessories = require("../models/accessories");
const Account = require("../models/accounts");
const Pant_shirt_sizes = require("../models/pant_shirt_sizes");
const Pant_shirt_size_detail = require("../models/product_size");
const Shoes_sizes = require("../models/shoes_sizes");
const Shoes_size_detail = require("../models/shoes_size_detail");
const Sizes = require("../models/sizes");

const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const Products = require("../models/products");
const Product_size = require("../models/product_size");
const createImportDetail = async (req, res) => {
  try {
    const { tshirt, shoes, pant, racket, accessory } = req.body;
    const newTshirt = tshirt.map((item) => ({ ...item, category: "tshirt" }));
    const newShoes = shoes.map((item) => ({ ...item, category: "shoes" }));
    const newPant = pant.map((item) => ({ ...item, category: "pant" }));
    const newRacket = racket.map((item) => ({ ...item, category: "racket" }));
    const newAccessory = accessory.map((item) => ({
      ...item,
      category: "accessory",
    }));

    const renamedData = [
      ...newTshirt,
      ...newShoes,
      ...newPant,
      ...newRacket,
      ...newAccessory,
    ];
    // console.log(renamedData);

    let wrongName = null;
    if (renamedData.length === 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "No data provided" });
    }
    let i = await Imports.create({ import_detail_id: [] });
    for (const e of renamedData) {
      // if (e.category != "shoes") {
      let item = await Products.findOne({
        name: new RegExp(e.name.trim(), "i"),
        category: e.category,
      }); //co dc product id -> can tim product_size id -> tim size id
      if (!item) {
        wrongName = e.name;
        res.status(200).json({ status: "fail", name: wrongName });
      } else {
        let sizeItem = null;
        sizeItem = await Sizes.findOne({
          name: new RegExp(e.size, "i"),
        });
        let product = await Product_size.findOne({
          size_id: sizeItem._id,
          product_id: item._id,
        });

        let i_detail = await Import_detail.create({
          product_id: product._id,
          quantity: e.quantity,
        });
        i.import_detail_id.push(i_detail._id);
      }
    }
    await i.save();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(error);
  }
};

const listImport = async (req, res) => {
  try {
    let list = await Imports.find({}).populate("import_detail_id");
    const listWithTotals = await Promise.all(
      list.map(async (e) => {
        let item = e.toObject();
        let total = 0;
        // console.log(e);
        let confirm = await Account.findOne({ _id: e.confirmed_user_id });

        e.import_detail_id.forEach((detail) => {
          total += detail.quantity;
          // console.log(detail);
        });
        item.quantity = total;
        if (confirm) {
          item.confirm = confirm.username;
        }
        return item;
      })
    );

    res.status(200).json(listWithTotals);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

const getDetailImport = async (req, res) => {
  let id = req.params.id;

  try {
    let detail = await Imports.findOne({ _id: id });
    //co import => co import detail => co pro size detail => co pro_id && size _id => co pro_name && size_name

    const fetchProduct = async (detailItem) => {
      if (detailItem.product_id) {
        //neu co product size detail
        let productSizeDetail = await Product_size.findOne({
          _id: detailItem.product_id,
        });
        let product = await Products.findOne({
          _id: productSizeDetail.product_id,
        });
        let size = await Sizes.findOne({
          _id: productSizeDetail.size_id,
        });

        return {
          name: product.name,
          size: size.name,
          price: product.price,
        };
      }
    };

    const detailArr = await Promise.all(
      detail.import_detail_id.map(async (e) => {
        const detailItem = await Import_detail.findOne({ _id: e });
        const product = await fetchProduct(detailItem);

        return { ...product, quantity: detailItem.quantity };
      })
    );
    console.log(detailArr);

    res.status(200).json(detailArr);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

const deleteImport = async (req, res) => {
  let id = req.params.id;
  try {
    let i = await Imports.findOne({ _id: id });

    let importDetailIds = i.import_detail_id;

    if (importDetailIds && importDetailIds.length > 0) {
      await Import_detail.deleteMany({ _id: { $in: importDetailIds } });
    }
    await i.deleteOne();
    res.status(200).json(i);
  } catch (error) {
    console.log(error);
  }
};

const confirmImport = async (req, res) => {
  let id = req.params.id;
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { username } = decoded;

    let user = await Account.findOne({ username });

    let im = await Imports.updateOne(
      { _id: id },
      { confirmed_user_id: user._id, status: "processing" }
    );
    //import => import detail => product size detail
    let imports = await Imports.findOne({ _id: id });
    imports.import_detail_id.forEach(async (e) => {
      let i = await Import_detail.findOne({ _id: e._id });
      if (i.product_id) {
        await Product_size.updateOne(
          { _id: i.product_id },
          { $inc: { quantity: i.quantity } }
        );
      }
    });

    res.status(200).json(im);
  } catch (error) {
    console.log(error);
  }
};

const getTemplateExcel = async (req, res) => {
  try {
    // Tạo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet1 = workbook.addWorksheet("tshirt");
    const worksheet2 = workbook.addWorksheet("shoes");
    const worksheet3 = workbook.addWorksheet("pant");
    const worksheet4 = workbook.addWorksheet("accessory");
    const worksheet5 = workbook.addWorksheet("racket");
    worksheet1.getRow(1).font = { bold: true };
    worksheet1.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet2.getRow(1).font = { bold: true };
    worksheet2.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet3.getRow(1).font = { bold: true };
    worksheet3.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet4.getRow(1).font = { bold: true };
    worksheet4.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet5.getRow(1).font = { bold: true };
    worksheet5.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet1.columns = [
      { header: "name", key: "name", width: 30 },
      { header: "quantity", key: "quantity", width: 20 },

      { header: "size", key: "size", width: 20 },
    ];

    worksheet1.addRows([
      {
        name: "tshirt example",
        quantity: "20",
        size: "L",
      },
    ]);

    worksheet2.columns = [
      { header: "name", key: "name", width: 30 },
      { header: "quantity", key: "quantity", width: 20 },

      { header: "size", key: "size", width: 20 },
    ];

    worksheet2.addRows([
      {
        name: "shoes example",
        quantity: "20",
        size: "42",
      },
    ]);

    worksheet3.columns = [
      { header: "name", key: "name", width: 30 },
      { header: "quantity", key: "quantity", width: 20 },

      { header: "size", key: "size", width: 20 },
    ];

    worksheet3.addRows([
      {
        name: "pant example",
        quantity: "20",
        size: "L",
      },
    ]);

    worksheet4.columns = [
      { header: "name", key: "name", width: 30 },
      { header: "quantity", key: "quantity", width: 20 },
      { header: "size", key: "size", width: 20 },
    ];

    worksheet4.addRows([
      {
        name: "accessories example",
        quantity: "20",
        size: "ONE SIZE",
      },
    ]);

    worksheet5.columns = [
      { header: "name", key: "name", width: 30 },
      { header: "quantity", key: "quantity", width: 20 },

      { header: "size", key: "size", width: 20 },
    ];

    worksheet5.addRows([
      {
        name: "racket example",
        quantity: "20",
        size: "4U",
      },
    ]);

    // Thiết lập header cho response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=example-import.xlsx"
    );

    console.log("Generating Excel file...");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send("Error generating Excel file");
  }
};

module.exports = {
  createImportDetail,
  listImport,
  getDetailImport,
  deleteImport,
  confirmImport,
  getTemplateExcel,
};
