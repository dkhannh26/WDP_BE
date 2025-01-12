const Pant = require("../models/pants");
const Image = require("../models/images");
const Pant_shirt_size_detail = require("../models/pant_shirt_size_detail");
const Pant_shirt_sizes = require("../models/pant_shirt_sizes");
const Discounts = require("../models/discounts")
const { uploadMultipleFiles } = require("../services/fileService");
const mongoose = require('mongoose');
const Images = require("../models/images");
const currentTimeInMillis = Date.now();
const currentDate = new Date(currentTimeInMillis);
const getPantList = async (req, res, next) => {
    try {
        let result = []
        let pants = await Pant.find({ deleted: false });


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
                pantDiscountPercent:
                    pantDiscount?.expired_at > currentDate ? pantDiscount?.percent : null
            };

            result.push(item);
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
        next()
    }
};

const getPantListIncrease = async (req, res, next) => {
    try {
        let result = []
        let pants = await Pant.find({ deleted: false });


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
                pantDiscountPercent:
                    pantDiscount?.expired_at > currentDate ? pantDiscount?.percent : null
            };

            result.push(item);
        }

        result.sort((a, b) => {
            let priceA
            let priceB
            if (a.pantDiscountPercent) {
                priceA = a.pantPrice - (a.pantPrice * a.pantDiscountPercent / 100);
            } else {
                priceA = a.pantPrice
            }

            if (b.pantDiscountPercent) {
                priceB = b.pantPrice - (b.pantPrice * b.pantDiscountPercent / 100);
            } else {
                priceB = b.pantPrice
            }
            return priceA - priceB;
        });

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
        next()
    }
};

const getPantListDecrease = async (req, res, next) => {
    try {
        let result = []
        let pants = await Pant.find({ deleted: false });


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
                pantDiscountPercent:
                    pantDiscount?.expired_at > currentDate ? pantDiscount?.percent : null
            };

            result.push(item);
        }

        result.sort((a, b) => {
            let priceA
            let priceB
            if (a.pantDiscountPercent) {
                priceA = a.pantPrice - (a.pantPrice * a.pantDiscountPercent / 100);
            } else {
                priceA = a.pantPrice
            }

            if (b.pantDiscountPercent) {
                priceB = b.pantPrice - (b.pantPrice * b.pantDiscountPercent / 100);
            } else {
                priceB = b.pantPrice
            }
            return priceB - priceA;
        });

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
        next()
    }
};

const getPant = async (req, res, next) => {
    try {
        const pant = await Pant.findById(req.params.id)
        if (pant) {
            const { name, price, discount_id } = pant

            const discount = await Discounts.findById(discount_id)

            const sizes = await Pant_shirt_size_detail.find({ pant_id: pant._id })
            let sizeResult = []


            for (const item of sizes) {
                const size = await Pant_shirt_sizes.findOne({ _id: item.size_id });

                sizeResult.push({
                    [size.size_name]: item.quantity,
                    [size.id]: item._id
                });
            }

            const images = await Images.find({ pant_id: pant._id })
            const imagesResult = []

            for (let img of images) {

                imagesResult.push({
                    pant_id: img.pant_id,
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
    }
    catch (error) {
        console.error(error)
        next()
    }
}

const addPant = async (req, res) => {
    let pantId //biến trả về cho FE để gọi api post hình
    try {
        let { name, price, size, discount_id } = req.body;
        let pant = await Pant.create({ name, price, discount_id });
        pantId = pant._id
        discount_id = new mongoose.Types.ObjectId(discount_id);
        if (size) {
            for (let key in size) {
                const sizeModel = await Pant_shirt_sizes.findOne({ size_name: key })
                Pant_shirt_size_detail.create({ pant_id: pant._id, size_id: sizeModel._id, quantity: size[key] })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }

    res.status(200).json(pantId)
};

const uploadPantImg = async (req, res) => {
    let fileArray //mảng chứa các file hình
    const pant_id = new mongoose.Types.ObjectId(req.params.id);

    // console.log(req.files)

    if (req.files) {
        if (!Array.isArray(req.files) || Object.keys(req.files).length !== 0) {
            fileArray = Object.values(req.files);
        }
        await uploadMultipleFiles(fileArray, pant_id, "pant");
    }
}

const deletePant = async (req, res) => {
    try {
        const id = req.params.id;
        let pant = await Pant.findOneAndUpdate({ _id: id }, { deleted: true });
        return res.status(200).json({ pant, message: "Delete successful" });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

const updatePant = async (req, res) => {
    try {
        await Images.deleteMany({ pant_id: req.params.id })
        let pant = await Pant.findOneAndUpdate({ _id: req.params.id }, req.body);
        await Pant_shirt_size_detail.deleteMany({ pant_id: req.params.id })

        const size = req.body.size
        if (size) {
            for (let key in size) {
                const sizeModel = await Pant_shirt_sizes.findOne({ size_name: key })
                Pant_shirt_size_detail.create({ pant_id: pant._id, size_id: sizeModel._id, quantity: size[key] })
            }
        }
        res.status(200).json(pant._id);
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

module.exports = { getPantList, getPant, addPant, deletePant, updatePant, uploadPantImg, getPantListIncrease, getPantListDecrease };
