const Shoes = require("../models/shoes");
const Image = require("../models/images");
const Pant_shirt_size_detail = require("../models/pant_shirt_size_detail");
const Pant_shirt_sizes = require("../models/pant_shirt_sizes");
const Discounts = require("../models/discounts")
const { uploadMultipleFiles } = require("../services/fileService");
const mongoose = require('mongoose');
const Images = require("../models/images");
const Shoes_sizes = require("../models/shoes_sizes");
const Shoes_size_detail = require("../models/shoes_size_detail");
const currentTimeInMillis = Date.now();
const currentDate = new Date(currentTimeInMillis);
const getShoesList = async (req, res) => {
    try {
        let result = []
        let shoesModel = await Shoes.find({ deleted: false });

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
                shoesDiscountPercent:
                    shoesDiscount?.expired_at > currentDate ? shoesDiscount?.percent : null
            };

            result.push(item);
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};

const getShoesListIncrease = async (req, res) => {
    try {
        let result = []
        let shoesModel = await Shoes.find({ deleted: false });

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
                shoesDiscountPercent:
                    shoesDiscount?.expired_at > currentDate ? shoesDiscount?.percent : null
            };

            result.push(item);
        }

        result.sort((a, b) => {
            let priceA
            let priceB
            if (a.shoesDiscountPercent) {
                priceA = a.shoesPrice - (a.shoesPrice * a.shoesDiscountPercent / 100);
            } else {
                priceA = a.shoesPrice
            }

            if (b.shoesDiscountPercent) {
                priceB = b.shoesPrice - (b.shoesPrice * b.shoesDiscountPercent / 100);
            } else {
                priceB = b.shoesPrice
            }
            return priceA - priceB;
        });
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};

const getShoesListDecrease = async (req, res) => {
    try {
        let result = []
        let shoesModel = await Shoes.find({ deleted: false });

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
                shoesDiscountPercent:
                    shoesDiscount?.expired_at > currentDate ? shoesDiscount?.percent : null
            };

            result.push(item);
        }

        result.sort((a, b) => {
            let priceA
            let priceB
            if (a.shoesDiscountPercent) {
                priceA = a.shoesPrice - (a.shoesPrice * a.shoesDiscountPercent / 100);
            } else {
                priceA = a.shoesPrice
            }

            if (b.shoesDiscountPercent) {
                priceB = b.shoesPrice - (b.shoesPrice * b.shoesDiscountPercent / 100);
            } else {
                priceB = b.shoesPrice
            }
            return priceB - priceA;
        });
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};



const getShoes = async (req, res) => {

    const shoesModel = await Shoes.findById(req.params.id)
    const { name, price, discount_id } = shoesModel

    const discount = await Discounts.findById(discount_id)

    const sizes = await Shoes_size_detail.find({ shoes_id: shoesModel._id })
    let sizeResult = []



    for (const item of sizes) {
        const size = await Shoes_sizes.findOne({ _id: item.size_id });
        console.log(size)
        sizeResult.push({
            [size.size_name]: item.quantity,
            [size.id]: item._id
        });
    }

    const images = await Images.find({ shoes_id: shoesModel._id })
    const imagesResult = []

    for (let img of images) {

        imagesResult.push({
            shoes_id: img.shoes_id,
            img_id: img._id,
            file_extension: img.file_extension
        })
    }

    const result = {
        name: name,
        price: price,
        discount:
            discount?.expired_at > currentDate ? {
                discount_id: discount?._id,
                percent: discount?.percent
            } : null
        ,
        size: sizeResult,
        images: imagesResult
    }

    res.status(200).json(result)

}

const addShoes = async (req, res) => {
    let shoesId //biến trả về cho FE để gọi api post hình
    try {
        let { name, price, size, discount_id } = req.body;
        let shoesModel = await Shoes.create({ name, price, discount_id });
        shoesId = shoesModel._id
        discount_id = new mongoose.Types.ObjectId(discount_id);

        if (size) {
            for (let key in size) {
                const sizeModel = await Shoes_sizes.findOne({ size_name: key })
                console.log(sizeModel);
                console.log(shoesModel);

                Shoes_size_detail.create({ shoes_id: shoesModel._id, size_id: sizeModel._id, quantity: size[key] })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }

    res.status(200).json(shoesId)
};

const uploadShoesImg = async (req, res) => {
    let fileArray //mảng chứa các file hình
    const shoes_id = new mongoose.Types.ObjectId(req.params.id);

    // console.log(req.files)

    if (req.files) {
        if (!Array.isArray(req.files) || Object.keys(req.files).length !== 0) {
            fileArray = Object.values(req.files);
        }
        await uploadMultipleFiles(fileArray, shoes_id, "shoes");
    }
}

const deleteShoes = async (req, res) => {
    try {
        const id = req.params.id;
        let shoesModel = await Shoes.findOneAndUpdate({ _id: id }, { deleted: true });
        return res.status(200).json({ shoesModel, message: "Delete successful" });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

const updateShoes = async (req, res) => {
    try {
        await Images.deleteMany({ shoes_id: req.params.id })
        let shoesModel = await Shoes.findOneAndUpdate({ _id: req.params.id }, req.body);
        await Shoes_size_detail.deleteMany({ shoes_id: req.params.id })
        const size = req.body.size
        if (size) {
            for (let key in size) {
                const sizeModel = await Shoes_sizes.findOne({ size_name: key })
                if (sizeModel) Shoes_size_detail.create({ shoes_id: shoesModel._id, size_id: sizeModel._id, quantity: size[key] })
            }
        }
        res.status(200).json(shoesModel._id);
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

module.exports = { getShoesList, getShoes, addShoes, deleteShoes, updateShoes, uploadShoesImg, getShoesListDecrease, getShoesListIncrease };
