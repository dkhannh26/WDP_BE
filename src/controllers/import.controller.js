require("dotenv").config();
const Import_detail = require("../models/import_details");
const Imports = require("../models/imports");
const Pants = require("../models/pants");
const Tshirts = require("../models/tshirts");
const Shoes = require("../models/shoes");
const Accessories = require("../models/accessories");
const Account = require("../models/accounts");
const Pant_shirt_sizes = require("../models/pant_shirt_sizes");
const Pant_shirt_size_detail = require("../models/pant_shirt_size_detail");
const Shoes_sizes = require("../models/shoes_sizes");
const Shoes_size_detail = require("../models/shoes_size_detail");
const jwt = require("jsonwebtoken");

// const createImportDetail = async (req, res) => {
//   const { pant, tshirt, shoes, accessory } = req.body;

//   try {
//     let i = await Imports.create({});
//     if (tshirt) {
//       tshirt.forEach(async (e) => {
//         let t = await Tshirts.findOne({ name: e.name });

//         if (t) {
//           let result = await Import_detail.create({
//             tshirt_id: t._id,
//             quantity: e.quantity,
//           });

//           i.import_detail_id.push(result._id);
//         }
//         await i.save();
//       });
//     }
//     if (pant) {
//       pant.forEach(async (e) => {
//         let p = await Pants.findOne({ name: e.name });
//         if (p) {
//           let result = await Import_detail.create({
//             pant_id: p._id,
//             quantity: e.quantity,
//           });
//           i.import_detail_id.push(result._id);
//           await i.save();
//         }
//       });
//     }
//     if (shoes) {
//       shoes.forEach(async (e) => {
//         let s = await Shoes.findOne({ name: e.name });
//         if (s) {
//           let result = await Import_detail.create({
//             shoes_id: s._id,
//             quantity: e.quantity,
//           });
//           i.import_detail_id.push(result._id);
//           await i.save();
//         }
//       });
//     }
//     if (accessory) {
//       accessory.forEach(async (e) => {
//         let a = await Accessories.findOne({ name: e.name });
//         if (a) {
//           let result = await Import_detail.create({
//             accessory_id: a._id,
//             quantity: e.quantity,
//           });
//           i.import_detail_id.push(result._id);
//           await i.save();
//         }
//       });
//     }
//     res.status(200).json(i);
//   } catch (error) {
//     console.log(error);
//   }
// };

const createImportDetail = async (req, res) => {
  const { pant, tshirt, shoes, accessory } = req.body;
  console.log(pant, tshirt, shoes, accessory);

  try {
    let i = await Imports.create({ import_detail_id: [] });

    const processItems = async (items, model, idField) => {
      const ids = [];

      for (const e of items) {
        const item = await model.findOne({ name: e.name });
        if (item) {
          const result = await Import_detail.create({
            [idField]: item._id,
            quantity: e.quantity,
          });
          ids.push(result._id);
        }
      }

      return ids;
    };

    const processItemsDetail = async (
      items,
      model,
      idField,
      modelSize,
      modelDetail
    ) => {
      const ids = [];

      for (const e of items) {
        //co id cua sp
        const item = await model.findOne({ name: e.name });
        //co id cua size
        let size = await modelSize.findOne({ size_name: e.size });
        // console.log(size);

        var query = {};
        query[idField] = item._id;
        // console.log(query);
        query["size_id"] = size._id;
        //lay id cua size detail = findOne sizeId && san pham ID
        let sizeDetail = await modelDetail.findOne(query);

        // console.log(sizeDetail);

        if (item) {
          const result = await Import_detail.create({
            [idField]: sizeDetail._id,
            quantity: e.quantity,
          });
          ids.push(result._id);
        }
      }

      return ids;
    };

    const tshirtIds = tshirt
      ? await processItemsDetail(
          tshirt,
          Tshirts,
          "tshirt_id",
          Pant_shirt_sizes,
          Pant_shirt_size_detail
        )
      : [];
    const pantIds = pant
      ? await processItemsDetail(
          pant,
          Pants,
          "pant_id",
          Pant_shirt_sizes,
          Pant_shirt_size_detail
        )
      : [];
    const shoeIds = shoes
      ? await processItemsDetail(
          shoes,
          Shoes,
          "shoes_id",
          Shoes_sizes,
          Shoes_size_detail
        )
      : [];
    const accessoryIds = accessory
      ? await processItems(accessory, Accessories, "accessory_id")
      : [];

    i.import_detail_id.push(
      ...tshirtIds,
      ...pantIds,
      ...shoeIds,
      ...accessoryIds
    );

    await i.save();

    res.status(200).json(i);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
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
      if (detailItem.tshirt_id) {
        let detail = await Pant_shirt_size_detail.findOne({
          _id: detailItem.tshirt_id,
        });
        let product = await Tshirts.findOne({ _id: detail.tshirt_id });
        let size = await Pant_shirt_sizes.findOne({ _id: detail.size_id });

        return {
          name: product.name,
          size: size.size_name,
          price: product.price,
        };
      } else if (detailItem.pant_id) {
        let detail = await Pant_shirt_size_detail.findOne({
          _id: detailItem.pant_id,
        });
        let product = await Pants.findOne({ _id: detail.pant_id });
        console.log(product);

        let size = await Pant_shirt_sizes.findOne({ _id: detail.size_id });
        return {
          name: product.name,
          size: size.size_name,
          price: product.price,
        };
      } else if (detailItem.accessory_id) {
        let product = await Accessories.findOne({
          _id: detailItem.accessory_id,
        });
        return {
          name: product.name,
          price: product.price,
        };
      } else {
        let detail = await Shoes_size_detail.findOne({
          _id: detailItem.shoes_id,
        });
        let product = await Shoes.findOne({ _id: detail.shoes_id });
        let size = await Shoes_sizes.findOne({ _id: detail.size_id });
        return {
          name: product.name,
          size: size.size_name,
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
    // console.log(detailArr);

    res.status(200).json(detailArr);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

const deleteImport = async (req, res) => {
  let id = req.params.id;
  try {
    let i = await Imports.deleteOne({ _id: id });
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
    const { username, email, password, phone, address, role } = decoded;

    let user = await Account.findOne({ username });

    let im = await Imports.updateOne(
      { _id: id },
      { confirmed_user_id: user._id, status: "processing" }
    );
    //import => import detail => product size detail
    let imports = await Imports.findOne({ _id: id });
    imports.import_detail_id.forEach(async (e) => {
      let i = await Import_detail.findOne({ _id: e._id });
      if (i.tshirt_id) {
        await Pant_shirt_size_detail.updateOne(
          {
            _id: i.tshirt_id,
          },
          {
            $inc: { quantity: i.quantity },
          }
        );
      } else if (i.pant_id) {
        await Pant_shirt_size_detail.updateOne(
          {
            _id: i.pant_id,
          },
          {
            $inc: { quantity: i.quantity },
          }
        );
      } else if (i.accessory_id) {
        await Accessories.updateOne(
          { _id: i.accessory_id },
          { $inc: { quantity: i.quantity } }
        );
      } else {
        await Shoes_size_detail.updateOne(
          {
            _id: i.shoes_id,
          },
          {
            $inc: { quantity: i.quantity },
          }
        );
      }
    });

    res.status(200).json(im);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createImportDetail,
  listImport,
  getDetailImport,
  deleteImport,
  confirmImport,
};
