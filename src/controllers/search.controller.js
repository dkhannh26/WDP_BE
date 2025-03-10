const Image = require("../models/images");
const Discounts = require("../models/discounts");
const Products = require("../models/products");

const getSearchList = async (req, res) => {
    try {
        let searchText = req.params.text;
        let result = []
        let productsRs = []

        const regex = new RegExp(searchText, "i"); // Dùng regex để tìm tên có chứa chuỗi `name`

        let products = await Products.aggregate([{ $match: { name: regex } }]);

        for (const product of products) {
            let productImg = await Image.find({ product_id: product._id });

            let { _id, name, price } = product;
            let productDiscount = await Discounts.findById(product.discount_id)
            let imageUrl = `/images/upload/${_id}/${productImg[0]?._id}${productImg[0]?.file_extension}`;

            let item = {
                productId: _id,
                productName: name,
                productPrice: price,
                productImg: imageUrl,
                productDiscountPercent: productDiscount?.percent
            };
            productsRs.push(item)
        }

        result = {
            products: productsRs,
        }

        return res.status(200).json({ data: result });

    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};



module.exports = { getSearchList };
