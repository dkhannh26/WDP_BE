// const Tshirt = require("../models/tshirts");
const Discounts = require("../../models/discounts")

// const { uploadMultipleFiles } = require("../services/fileService");
const mongoose = require('mongoose');
const Images = require("../../models/images");
const Sizes = require("../../models/sizes");

const Products = require("../../models/products");
const Product_size = require("../../models/product_size");
const Brand = require("../../models/brands");
const currentTimeInMillis = Date.now();
const currentDate = new Date(currentTimeInMillis);

const getProductList = async (req, res) => {

    try {
        let result = []
        const query = { deleted: false };

        if (req.query.category) {
            query.category = req.query.category;
        }

        let products = await Products.find(query);

        for (const product of products) {
            let imageUrl = ''
            let productImg = await Images.find({ product_id: product._id });
            if (productImg.length !== 0) {
                imageUrl = `/images/upload/${product._id}/${productImg[0]?._id}${productImg[0]?.file_extension}`;
            }

            let { _id, name, price, category } = product;
            let productDiscount = await Discounts.findById(product.discount_id)

            let item = {
                productId: _id,
                productName: name,
                productCategory: category,
                productPrice: price,
                productImg: imageUrl,
                productDiscountPercent:
                    productDiscount?.expired_at > currentDate ? productDiscount?.percent : null
            };

            result.push(item);
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};

const getProductDetail = async (req, res) => {

    const product = await Products.findById(req.params.id)
    const { name, price, discount_id, brand_id } = product

    const brand = await Brand.findById(brand_id)
    const discount = await Discounts.findById(discount_id)

    const sizes = await Product_size.find({ product_id: product._id })
    let sizeResult = []


    for (const item of sizes) {
        const size = await Sizes.findOne({ _id: item.size_id });

        sizeResult.push({
            size_id: size.id,
            product_size_id: item._id,
            size_name: size.size_name,
            quantity: item.quantity
        });
    }
    const images = await Images.find({ product_id: product._id })
    const imagesResult = []

    for (let img of images) {

        imagesResult.push({
            product_id: img.product_id,
            img_id: img._id,
            file_extension: img.file_extension
        })
    }

    const result = {
        name: name,
        brand: brand?.name,
        price: price,
        discount: discount?.expired_at > currentDate ? {
            discount_id: discount?._id,
            percent: discount?.percent
        } : null,
        size: sizeResult,
        images: imagesResult
    }

    res.status(200).json(result)
}
// const getTshirtListIncrease = async (req, res) => {
//   try {
//     let result = []
//     let tshirts = await Tshirt.find({ deleted: false });


//     for (const tshirt of tshirts) {
//       let tshirtImg = await Image.find({ tshirt_id: tshirt._id });

//       let { _id, name, price } = tshirt;
//       let tshirtDiscount = await Discounts.findById(tshirt.discount_id)
//       let imageUrl = `/images/upload/${_id}/${tshirtImg[0]?._id}${tshirtImg[0]?.file_extension}`;

//       let item = {
//         tshirtId: _id,
//         tshirtName: name,
//         tshirtPrice: price,
//         tshirtImg: imageUrl,
//         tshirtDiscountPercent:
//           tshirtDiscount?.expired_at > currentDate ? tshirtDiscount?.percent : null
//       };
//       result.push(item);
//     }
//     result.sort((a, b) => {
//       let priceA
//       let priceB
//       if (a.tshirtDiscountPercent) {
//         priceA = a.tshirtPrice - (a.tshirtPrice * a.tshirtDiscountPercent / 100);
//       } else {
//         priceA = a.tshirtPrice
//       }

//       if (b.tshirtDiscountPercent) {
//         priceB = b.tshirtPrice - (b.tshirtPrice * b.tshirtDiscountPercent / 100);
//       } else {
//         priceB = b.tshirtPrice
//       }
//       return priceA - priceB;
//     });

//     return res.status(200).json({ data: result });
//   } catch (error) {
//     console.error(error);
//     res.status(404).json({ error });
//   }
// };

// const getTshirtListDecrease = async (req, res) => {
//   try {
//     let result = []
//     let tshirts = await Tshirt.find({ deleted: false });


//     for (const tshirt of tshirts) {
//       let tshirtImg = await Image.find({ tshirt_id: tshirt._id });

//       let { _id, name, price } = tshirt;
//       let tshirtDiscount = await Discounts.findById(tshirt.discount_id)
//       let imageUrl = `/images/upload/${_id}/${tshirtImg[0]?._id}${tshirtImg[0]?.file_extension}`;

//       let item = {
//         tshirtId: _id,
//         tshirtName: name,
//         tshirtPrice: price,
//         tshirtImg: imageUrl,
//         tshirtDiscountPercent:
//           tshirtDiscount?.expired_at > currentDate ? tshirtDiscount?.percent : null
//       };
//       result.push(item);
//     }
//     result.sort((a, b) => {
//       let priceA
//       let priceB
//       if (a.tshirtDiscountPercent) {
//         priceA = a.tshirtPrice - (a.tshirtPrice * a.tshirtDiscountPercent / 100);
//       } else {
//         priceA = a.tshirtPrice
//       }

//       if (b.tshirtDiscountPercent) {
//         priceB = b.tshirtPrice - (b.tshirtPrice * b.tshirtDiscountPercent / 100);
//       } else {
//         priceB = b.tshirtPrice
//       }
//       return priceB - priceA;
//     });
//     return res.status(200).json({ data: result });
//   } catch (error) {
//     console.error(error);
//     res.status(404).json({ error });
//   }
// };





//   const images = await Images.find({ tshirt_id: tshirt._id })
//   const imagesResult = []


//   for (let img of images) {

//     imagesResult.push({
//       tshirt_id: img.tshirt_id,
//       img_id: img._id,
//       file_extension: img.file_extension
//     })
//   }

//   const result = {
//     name: name,
//     price: price,
//     discount: discount?.expired_at > currentDate ? {
//       discount_id: discount?._id,
//       percent: discount?.percent
//     } : null,
//     size: sizeResult,
//     images: imagesResult
//   }

//   res.status(200).json(result)

// }

// const addTshirt = async (req, res, next) => {
//   let tshirtID //biến trả về cho FE để gọi api post hình
//   try {
//     let { name, price, size, discount_id } = req.body;
//     let tshirt = await Tshirt.create({ name, price, discount_id });
//     tshirtID = tshirt._id
//     discount_id = new mongoose.Types.ObjectId(discount_id);

//     if (size) {
//       for (let key in size) {
//         const sizeModel = await Pant_shirt_sizes.findOne({ size_name: key })
//         Pant_shirt_size_detail.create({ tshirt_id: tshirt._id, size_id: sizeModel._id, quantity: size[key] })
//       }
//     }

//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ error });
//     next()
//   }

//   res.status(200).json(tshirtID)
// };

// const uploadTshirtImg = async (req, res) => {
//   let fileArray //mảng chứa các file hình
//   const shirt_id = new mongoose.Types.ObjectId(req.params.id);

//   if (req.files) {
//     if (!Array.isArray(req.files) || Object.keys(req.files).length !== 0) {
//       fileArray = Object.values(req.files);
//     }
//     await uploadMultipleFiles(fileArray, shirt_id, 'shirt');
//   }
// }

// const deleteTshirt = async (req, res) => {
//   try {
//     const id = req.params.id;
//     let tshirt = await Tshirt.findOneAndUpdate({ _id: id }, { deleted: true });
//     return res.status(200).json({ tshirt, message: "Delete successful" });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ error });
//   }
// };

// const updateTshirt = async (req, res) => {
//   try {
//     await Images.deleteMany({ tshirt_id: req.params.id })
//     let tshirt = await Tshirt.findOneAndUpdate({ _id: req.params.id }, req.body);
//     await Pant_shirt_size_detail.deleteMany({ tshirt_id: req.params.id })

//     const size = req.body.size
//     if (size) {
//       for (let key in size) {
//         const sizeModel = await Pant_shirt_sizes.findOne({ size_name: key })
//         Pant_shirt_size_detail.create({ tshirt_id: tshirt._id, size_id: sizeModel._id, quantity: size[key] })
//       }
//     }
//     res.status(200).json(tshirt._id);
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ error });
//   }
// };

module.exports = { getProductList, getProductDetail };
