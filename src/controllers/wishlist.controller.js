const WishlistModel = require('../models/wishlist')
const Account = require('../models/accounts');
const Discounts = require('../models/discounts');
const ProductSize = require('../models/product_size');
const Sizes = require('../models/sizes');
const Product = require('../models/products');
const { ObjectId } = require('mongoose').Types;

class WishlistController {
    async getList(req, res, next) {
        const { accountId } = req.params;
        try {
            const wishlist = await WishlistModel.aggregate([
                {
                    $match: { account_id: new ObjectId(accountId) }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'product_info',
                    },
                },
                { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'product_size',
                        localField: 'product_info._id',
                        foreignField: 'product_id',
                        as: 'product_size_info',
                    },
                },
                { $unwind: { path: '$product_size_info', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'sizes',
                        localField: 'product_size_info.size_id',
                        foreignField: '_id',
                        as: 'product_size_name_info',
                    },
                },
                { $unwind: { path: '$product_size_name_info', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'discounts',
                        localField: 'product_info.discount_id',
                        foreignField: '_id',
                        as: 'product_discount_info',
                    },
                },
                { $unwind: { path: '$product_discount_info', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'images',
                        localField: 'product_info._id',
                        foreignField: 'product_id',
                        as: 'product_images_info',
                    },
                },
                { $unwind: { path: '$product_images_info', preserveNullAndEmptyArrays: true } },

                {
                    $group: {
                        _id: '$_id',
                        product_size_name: { $first: '$product_size_name_info.name' },
                        product_name: { $first: '$product_info.name' },
                        product_id: { $first: '$product_info._id' },
                        price: { $first: '$product_info.price' },
                        images: { $push: '$product_images_info' },
                        discount: { $first: '$product_discount_info.percent' },
                        product_size_id: { $first: '$product_size_info._id' },
                        quantity: { $sum: '$product_size_info.quantity' },
                    },
                },

                {
                    $addFields: {
                        image: {
                            $cond: {
                                if: { $gt: [{ $size: '$images' }, 0] },
                                then: {
                                    $concat: [
                                        { $toString: { $arrayElemAt: ['$images._id', 0] } },
                                        { $arrayElemAt: ['$images.file_extension', 0] }
                                    ]
                                },
                                else: ''
                            },
                        },
                    }
                },

                {
                    $project: {
                        _id: 1,
                        product_size_name: 1,
                        product_name: 1,
                        product_id: 1,
                        price: 1,
                        discount: 1,
                        image: 1,
                        product_size_id: 1,
                        quantity: 1,
                        cartQuantity: 1,
                    },
                }
            ]);

            res.status(200).json({ data: wishlist });
        } catch (error) {
            next(error);
        }
    }

    create(req, res, next) {
        WishlistModel.create(req.body)
            .then(() => {
                console.log('aaa');
                res.send('Create wishlist successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }

    getById(req, res, next) {
        WishlistModel.findById(req.params.id)
            .then(wishlist => {
                res.json(wishlist)
            })
            .catch(error => {
                console.log(error)
            })
    }

    update(req, res, next) {
        WishlistModel.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.send('Update wishlist successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }

    delete(req, res, next) {
        WishlistModel.deleteOne({ _id: req.params.id })
            .then(() => {
                res.send('remove wishlist successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }
    async checkWishlist(req, res, next) {
        const { userId, productId } = req.query;
        try {
            const wishlistItem = await WishlistModel.findOne({
                account_id: new ObjectId(userId),
                product_id: new ObjectId(productId),
            });

            res.status(200).json({
                isLiked: !!wishlistItem,
            });
        } catch (error) {
            console.error('Error checking wishlist:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new WishlistController

