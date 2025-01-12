const Tshirt = require("../models/tshirts");
const Image = require("../models/images");
const Discounts = require("../models/discounts");
const Pants = require("../models/pants");
const Shoes = require("../models/shoes");
const Accessories = require("../models/accessories");

const getSearchList = async (req, res) => {
    try {
        let searchText = req.params.text;
        let result = []
        let tshirtsRs = []
        let pantsRs = []
        let shoesRs = []
        let accessoriesRs = []

        const regex = new RegExp(searchText, "i"); // Dùng regex để tìm tên có chứa chuỗi `name`

        let tshirts = await Tshirt.aggregate([{ $match: { name: regex } }]);
        let pants = await Pants.aggregate([{ $match: { name: regex } }]);
        let shoesModel = await Shoes.aggregate([{ $match: { name: regex } }]);
        let accessories = await Accessories.aggregate([{ $match: { name: regex } }]);

        for (const tshirt of tshirts) {
            let tshirtImg = await Image.find({ tshirt_id: tshirt._id });

            let { _id, name, price } = tshirt;
            let tshirtDiscount = await Discounts.findById(tshirt.discount_id)
            let imageUrl = `/images/upload/${_id}/${tshirtImg[0]?._id}${tshirtImg[0]?.file_extension}`;

            let item = {
                tshirtId: _id,
                tshirtName: name,
                tshirtPrice: price,
                tshirtImg: imageUrl,
                tshirtDiscountPercent: tshirtDiscount?.percent
            };
            tshirtsRs.push(item)
        }



        for (const pant of pants) {
            let pantImg = await Image.find({ pant_id: pant._id });

            let { _id, name, price } = pant;
            let pantDiscount = await Discounts.findById(pant.discount_id)
            let imageUrl = `/images/upload/${_id}/${pantImg[0]?._id}${pantImg[0]?.file_extension}`;

            let item = {
                pantId: _id,
                pantName: name,
                pantPrice: price,
                pantImg: imageUrl,
                pantDiscountPercent: pantDiscount?.percent
            };

            pantsRs.push(item);
        }

        for (const shoes of shoesModel) {
            let shoesImg = await Image.find({ shoes_id: shoes._id });
            let { _id, name, price } = shoes;
            let shoesDiscount = await Discounts.findById(shoes.discount_id)
            let imageUrl = `/images/upload/${_id}/${shoesImg[0]?._id}${shoesImg[0]?.file_extension}`;

            let item = {
                shoesId: _id,
                shoesName: name,
                shoesPrice: price,
                shoesImg: imageUrl,
                shoesDiscountPercent: shoesDiscount?.percent
            };

            shoesRs.push(item);
        }

        for (const accessory of accessories) {
            let accessoryImg = await Image.find({ accessory_id: accessory._id });

            let { _id, name, price } = accessory;
            let accessoryDiscount = await Discounts.findById(accessory.discount_id)
            let imageUrl = `/images/upload/${_id}/${accessoryImg[0]?._id}${accessoryImg[0]?.file_extension}`;

            let item = {
                accessoryId: _id,
                accessoryName: name,
                accessoryPrice: price,
                accessoryImg: imageUrl,
                accessoryDiscountPercent: accessoryDiscount?.percent
            };

            accessoriesRs.push(item);
        }
        result = {
            tshirts: tshirtsRs,
            pants: pantsRs,
            shoesList: shoesRs,
            accessories: accessoriesRs
        }

        return res.status(200).json({ data: result });

    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};



module.exports = { getSearchList };
