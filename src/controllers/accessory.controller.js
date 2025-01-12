const Accessories = require("../models/accessories");
const Image = require("../models/images");
const Pant_shirt_size_detail = require("../models/pant_shirt_size_detail");
const Pant_shirt_sizes = require("../models/pant_shirt_sizes");
const Discounts = require("../models/discounts")
const { uploadMultipleFiles } = require("../services/fileService");
const mongoose = require('mongoose');
const Images = require("../models/images");

const currentTimeInMillis = Date.now();
const currentDate = new Date(currentTimeInMillis);

const getAccessoryList = async (req, res) => {
    try {
        let result = []
        let accessories = await Accessories.find({ deleted: false });


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
                accessoryDiscountPercent:
                    accessoryDiscount?.expired_at > currentDate ? accessoryDiscount?.percent : null
            };

            result.push(item);
        }
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};

const getAccessoryListIncrease = async (req, res) => {
    try {
        let result = []
        let accessories = await Accessories.find({ deleted: false });

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
                accessoryDiscountPercent:
                    accessoryDiscount?.expired_at > currentDate ? accessoryDiscount?.percent : null
            };



            result.push(item);
        }
        result.sort((a, b) => {
            let priceA
            let priceB
            if (a.accessoryDiscountPercent) {
                priceA = a.accessoryPrice - (a.accessoryPrice * a.accessoryDiscountPercent / 100);
            } else {
                priceA = a.accessoryPrice
            }

            if (b.accessoryDiscountPercent) {
                priceB = b.accessoryPrice - (b.accessoryPrice * b.accessoryDiscountPercent / 100);
            } else {
                priceB = b.accessoryPrice
            }
            return priceA - priceB
        });

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};

const getAccessoryListDecrease = async (req, res) => {
    try {
        let result = []
        let accessories = await Accessories.find({ deleted: false });

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
                accessoryDiscountPercent:
                    accessoryDiscount?.expired_at > currentDate ? accessoryDiscount?.percent : null
            };

            result.push(item);
        }
        result.sort((a, b) => {
            let priceA
            let priceB
            if (a.accessoryDiscountPercent) {
                priceA = a.accessoryPrice - (a.accessoryPrice * a.accessoryDiscountPercent / 100);
            } else {
                priceA = a.accessoryPrice
            }

            if (b.accessoryDiscountPercent) {
                priceB = b.accessoryPrice - (b.accessoryPrice * b.accessoryDiscountPercent / 100);
            } else {
                priceB = b.accessoryPrice
            }
            return priceB - priceA
        });

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error });
    }
};



const getAccessory = async (req, res) => {
    const accessory = await Accessories.findById(req.params.id)
    const { name, price, discount_id, quantity } = accessory

    const discount = await Discounts.findById(discount_id)

    const images = await Images.find({ accessory_id: accessory._id })
    const imagesResult = []


    for (let img of images) {
        imagesResult.push({
            accessory_id: img.accessory_id,
            img_id: img._id,
            file_extension: img.file_extension
        })
    }

    const result = {
        name: name,
        price: price,
        discount: discount?.expired_at > currentDate ?
            {
                discount_id: discount?._id,
                percent: discount?.percent
            }
            :
            null
        ,
        quantity: quantity,
        images: imagesResult
    }

    res.status(200).json(result)

}

const addAccessory = async (req, res) => {
    let accessoryID //biến trả về cho FE để gọi api post hình
    try {
        let { name, price, discount_id, quantity } = req.body;
        let accessory = await Accessories.create({ name, price, discount_id, quantity });
        accessoryID = accessory._id
        discount_id = new mongoose.Types.ObjectId(discount_id);

    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }

    res.status(200).json(accessoryID)
};

const uploadAccessoryImg = async (req, res) => {
    let fileArray //mảng chứa các file hình
    const accessory_id = new mongoose.Types.ObjectId(req.params.id);

    console.log(req.files)
    if (req.files) {
        if (!Array.isArray(req.files) || Object.keys(req.files).length !== 0) {
            fileArray = Object.values(req.files);
        }
        await uploadMultipleFiles(fileArray, accessory_id, 'accessory');
    }
}

const deleteAccessory = async (req, res) => {
    try {
        const id = req.params.id;
        let accessory = await Accessories.findOneAndUpdate({ _id: id }, { deleted: true });
        return res.status(200).json({ accessory, message: "Delete successful" });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

const updateAccessory = async (req, res) => {
    try {
        await Images.deleteMany({ accessory_id: req.params.id })
        let accessory = await Accessories.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.status(200).json(accessory._id);
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

module.exports = { getAccessoryList, addAccessory, deleteAccessory, updateAccessory, getAccessory, uploadAccessoryImg, getAccessoryListIncrease, getAccessoryListDecrease };
