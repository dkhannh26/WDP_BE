const Orders = require('../models/orders');
const mongoose = require("mongoose");
const OrderDetails = require('../models/order_detail');
const ProductSizes = require('../models/product_size');
const Products = require('../models/products');
const Brands = require('../models/brands');
const { uploadOrderImages } = require("../services/fileService");
const ImageOrder = require('../models/image_order')
const { ObjectId } = require('mongodb');

class OrderController {
    getList(req, res, next) {
        Orders.find({})
            .populate('account_id')
            .populate('confirm_user_id')
            .then((orders) => {
                res.status(200).json(orders);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getAllRefund(req, res, next) {
        Orders.find({
            status: { $in: ['Return Approved', "Pending Approval", 'Reject'] }
        })
            .populate('account_id')
            .populate('confirm_user_id')
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    createOrder(req, res, next) {
        Orders.create(req.body)
            .then(async (order) => {
                const { orderItems } = req.body;
                const orderDetailsData = orderItems.map(item => ({
                    order_id: order._id,
                    product_size_id: item.product_size_id,
                    quantity: Number(item.quantity),
                    discount: Number(item.discount)
                }));
                console.log(orderDetailsData);
                const orderDetails = await OrderDetails.create(orderDetailsData);
                res.status(201).json({
                    orderDetails,
                });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: err.message });
            });
    }


    deleteAllOrder(req, res, next) {
        Orders.deleteMany({})
            .then((Orders) => {
                res.status(200).json(Orders);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getOrderById(req, res, next) {
        Orders.findById(req.params.orderId)
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    updateOrderById(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, req.body, { new: true })
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    deleteOrderById(req, res, next) {
        Orders.findByIdAndDelete(req.params.orderId)
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getOrderByAccountId(req, res, next) {
        Orders.find({ account_id: req.params.accountId })
            .populate('account_id', 'username')
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getOrderHistoryByAccountId(req, res, next) {
        Orders.find({
            // accountId: req.params.accountId,
            status: { $in: ['shipped', 'cancelled'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);

            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getListDone(req, res, next) {
        const { accountId } = req.params;
        console.log(accountId);
        Orders.find({
            account_id: accountId,
            status: { $in: ['Completed'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    getListCancel(req, res, next) {
        const { accountId } = req.params;
        console.log(accountId);
        Orders.find({
            account_id: accountId,
            status: { $in: ['Cancelled'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    getListTransit(req, res, next) {
        const { accountId } = req.params;
        console.log(accountId);
        Orders.find({
            account_id: accountId,
            status: { $in: ['In Transit'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    getListAll(req, res, next) {
        const { accountId } = req.params;
        console.log(accountId);
        Orders.find({
            account_id: accountId,
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    getListRefund(req, res, next) {
        const { accountId } = req.params;
        console.log(accountId);
        Orders.find({
            account_id: accountId,
            status: { $in: ['Pending Approval', 'Return Approved', 'Reject'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    getListPending(req, res, next) {
        const { accountId } = req.params;
        console.log(accountId);
        Orders.find({
            account_id: accountId,
            status: { $in: ['Pending', 'Paid'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    confirmOrder(req, res, next) {
        const orderId = req.params.orderId;
        const updateData = req.body.updateData;
        console.log('zzzz', updateData.confirm_user_id);
        Orders.findByIdAndUpdate(orderId, { status: 'In Transit', confirm_user_id: updateData.confirm_user_id }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) {
                    return res.status(404).json({ message: 'Order not found' });
                }

                const updateProductQuantityPromises = updateData.product_size_id.map((id, index) => {
                    if (id) {
                        return ProductSizes.findById(id)
                            .then((productDetail) => {
                                if (!productDetail) {
                                    throw new Error(`ProductSize with ID ${id} not found`);
                                }

                                const newQuantity = productDetail.quantity - updateData.quantities[index];

                                if (newQuantity < 0) {
                                    return Products.findById(productDetail.product_id)
                                        .then((product) => {
                                            return Promise.reject(
                                                new Error(`Sản phẩm ${product.name} nằm trong đơn hàng này đã hết hàng`)
                                            );
                                        });
                                }

                                return ProductSizes.findByIdAndUpdate(
                                    id,
                                    { quantity: newQuantity },
                                    { new: true }
                                );
                            });
                    }
                });

                Promise.all(updateProductQuantityPromises)
                    .then(() => {
                        res.status(200).json(order);
                    })
                    .catch((err) => {
                        if (err.message.includes('đã hết hàng')) {
                            Orders.findByIdAndUpdate(orderId, { status: 'Pending' }, { new: true })
                                .then(() => {
                                    res.status(400).json({ message: err.message });
                                })
                                .catch((updateErr) => {
                                    res.status(500).json({ error: 'Failed to revert order status: ' + updateErr.message });
                                });
                        } else {
                            res.status(500).json({ error: err.message });
                        }
                    });
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    cancelOrder(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'Cancelled' }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }

    shippedOrder(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'Completed' }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    returnOrder(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'Pending Approval' }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    rejectRefund(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'Reject' }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    confirmRefund(req, res, next) {
        const updateData = req.body.updateData;
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'Return Approved', confirm_user_id: updateData.confirm_user_id }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
                const updateProductQuantity = updateData.product_size_id.map((id, index) => {
                    if (id) {
                        return ProductSizes.findById(id)
                            .then((productDetail) => {
                                if (productDetail) {
                                    const newQuantity = productDetail.quantity + updateData.quantities[index];
                                    return ProductSizes.findByIdAndUpdate(
                                        id,
                                        { quantity: newQuantity },
                                        { new: true }
                                    );
                                } else {
                                    throw new Error(`PantShirtSizeDetail with ID ${id} not found`);
                                }
                            });
                    }

                });
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }

    async getOrderDetails(req, res, next) {
        const { orderId } = req.params;
        try {
            const carts = await OrderDetails.aggregate([
                {
                    $match: { order_id: new ObjectId(orderId) }
                },
                {
                    $lookup: {
                        from: "orders",
                        localField: "order_id",
                        foreignField: "_id",
                        as: "order_info"
                    }
                },
                {
                    $lookup: {
                        from: "product_size",
                        localField: "product_size_id",
                        foreignField: "_id",
                        as: "product_size_info"
                    }
                },
                { $unwind: "$product_size_info" },
                {
                    $lookup: {
                        from: "sizes",
                        localField: "product_size_info.size_id",
                        foreignField: "_id",
                        as: "product_size_name_info"
                    }
                },
                { $unwind: { path: "$product_size_name_info", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "products",
                        localField: "product_size_info.product_id",
                        foreignField: "_id",
                        as: "product_info"
                    }
                },
                { $unwind: { path: "$product_info", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "discounts",
                        localField: "product_info.discount_id",
                        foreignField: "_id",
                        as: "product_discount_info"
                    }
                },
                { $unwind: { path: "$product_discount_info", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "images",
                        localField: "product_info._id",
                        foreignField: "product_id",
                        as: "product_images_info"
                    }
                },
                { $unwind: { path: "$product_images_info", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "image_orders",
                        localField: "order_id",
                        foreignField: "order_id",
                        as: "order_images_info"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        createdAt: { $first: "$createdAt" },
                        order_id: { $first: { $first: "$order_info._id" } },
                        product_size_name: { $first: "$product_size_name_info.name" },
                        product_name: { $first: "$product_info.name" },
                        product_id: { $first: "$product_info._id" },
                        price: { $first: "$product_info.price" },
                        images: { $push: "$product_images_info" },
                        order_images: { $first: "$order_images_info" }, // Giữ nguyên mảng hình ảnh từ image_order
                        discount: { $first: "$discount" },
                        expired_day: { $first: "$product_discount_info.expired_at" },
                        product_size_id: { $first: "$product_size_info._id" },
                        quantity: { $first: "$product_size_info.quantity" },
                        cartQuantity: { $first: "$quantity" }
                    }
                },
                {
                    $addFields: {
                        image: {
                            $cond: {
                                if: { $gt: [{ $size: "$images" }, 0] },
                                then: {
                                    $concat: [
                                        { $toString: { $arrayElemAt: ["$images._id", 0] } },
                                        { $arrayElemAt: ["$images.file_extension", 0] }
                                    ]
                                },
                                else: ""
                            }
                        },
                        order_images: {
                            $map: {
                                input: "$order_images",
                                as: "img",
                                in: {
                                    $concat: [
                                        { $toString: "$$img._id" },
                                        "$$img.file_extension"
                                    ]
                                }
                            }
                        },
                        discount: {
                            $cond: {
                                if: { $gt: ["$expired_day", "$$NOW"] },
                                then: null,
                                else: "$discount"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        order_id: 1,
                        product_size_name: 1,
                        product_name: 1,
                        product_id: 1,
                        price: 1,
                        discount: 1,
                        expired_day: 1,
                        image: 1,
                        order_images: 1, // Trả về mảng order_images thay vì order_image
                        product_size_id: 1,
                        quantity: 1,
                        cartQuantity: 1
                    }
                }
            ]);

            res.status(200).json({ data: carts });
        } catch (error) {
            next(error);
        }
    }
    async getTop10ProductsByCategory(req, res, next) {
        try {
            const topProducts = await OrderDetails.aggregate([
                {
                    $lookup: {
                        from: 'product_size',
                        localField: 'product_size_id',
                        foreignField: '_id',
                        as: 'product_size_info',
                    },
                },
                {
                    $unwind: '$product_size_info',
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product_size_info.product_id',
                        foreignField: '_id',
                        as: 'product_info',
                    },
                },
                {
                    $unwind: '$product_info',
                },
                {
                    $lookup: {
                        from: 'images',
                        localField: 'product_info._id',
                        foreignField: 'product_id',
                        as: 'product_images',
                    },
                },
                {
                    $project: {
                        'product_images.createdAt': 0,
                        'product_images.updatedAt': 0,
                    },
                },
                {
                    $lookup: {
                        from: 'discounts',
                        localField: 'product_info.discount_id',
                        foreignField: '_id',
                        as: 'product_discount',
                    },
                },
                {
                    $unwind: {
                        path: '$product_discount',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: {
                            product_id: '$product_info._id',
                            category: '$product_info.category',
                            product: '$product_info.name',
                        },
                        totalQuantity: { $sum: '$quantity' },
                        images: { $first: '$product_images' },
                        price: { $first: '$product_info.price' },
                        discount: { $first: '$product_discount.percent' },
                    },
                },
                {
                    $sort: {
                        '_id.category': 1,
                        totalQuantity: -1,
                    },
                },
                {
                    $group: {
                        _id: '$_id.category',
                        topProducts: {
                            $push: {
                                product_id: '$_id.product_id',
                                productName: '$_id.product',
                                productPrice: '$price',
                                productDiscount: '$discount',
                                totalQuantity: '$totalQuantity',
                                images: '$images',
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        topProducts: {
                            $map: {
                                input: '$topProducts',
                                as: 'product',
                                in: {
                                    $mergeObjects: [
                                        '$$product',
                                        {
                                            image: {
                                                $cond: {
                                                    if: { $gt: [{ $size: '$$product.images' }, 0] },
                                                    then: {
                                                        $concat: [
                                                            '/images/upload/',
                                                            { $toString: '$$product.product_id' },
                                                            '/',
                                                            { $toString: { $arrayElemAt: ['$$product.images._id', 0] } },
                                                            { $arrayElemAt: ['$$product.images.file_extension', 0] }
                                                        ]
                                                    },
                                                    else: ''
                                                },
                                            },
                                        },
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        category: '$_id',
                        topProducts: { $slice: ['$topProducts', 10] },
                    },
                },
            ]);

            res.status(200).json({ data: topProducts });
        } catch (error) {
            next(error);
        }
    }

    async getHotBrands(req, res, next) {
        try {
            const hotBrands = await Products.aggregate([
                {
                    $lookup: {
                        from: 'brands',
                        localField: 'brand_id',
                        foreignField: '_id',
                        as: 'brand_info',
                    },
                },

                {
                    $unwind: '$brand_info',
                },
                {
                    $lookup: {
                        from: 'images',
                        localField: '_id',
                        foreignField: 'product_id',
                        as: 'product_images',
                    },
                },
                {
                    $lookup: {
                        from: 'discounts',
                        localField: 'discount_id',
                        foreignField: '_id',
                        as: 'product_discount',
                    },
                },
                {
                    $unwind: {
                        path: '$product_discount',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: {
                            product_id: '$_id',
                            brand: '$brand_info.name',
                            product: '$name',
                        },
                        images: { $first: '$product_images' },
                        price: { $first: '$price' },
                        discount: { $first: '$product_discount.percent' },
                        createdAt: { $first: '$createdAt' },
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                        '_id.brand': 1,
                    },
                },
                {
                    $group: {
                        _id: '$_id.brand',
                        hotBrands: {
                            $push: {
                                product_id: '$_id.product_id',
                                productName: '$_id.product',
                                productPrice: '$price',
                                productDiscount: '$discount',
                                images: '$images',
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        hotBrands: {
                            $map: {
                                input: '$hotBrands',
                                as: 'product',
                                in: {
                                    $mergeObjects: [
                                        '$$product',
                                        {
                                            image: {
                                                $cond: {
                                                    if: { $gt: [{ $size: '$$product.images' }, 0] },
                                                    then: {
                                                        $concat: [
                                                            '/images/upload/',
                                                            { $toString: '$$product.product_id' },
                                                            '/',
                                                            { $toString: { $arrayElemAt: ['$$product.images._id', 0] } },
                                                            { $arrayElemAt: ['$$product.images.file_extension', 0] }
                                                        ]
                                                    },
                                                    else: ''
                                                },
                                            },
                                        },
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        brand: '$_id',
                        hotBrands: { $slice: ['$hotBrands', 5] },
                    },
                },
            ]);
            res.status(200).json({ data: hotBrands });
        } catch (error) {
            next(error);
        }
    }
    async getAllOrderDetails(req, res, next) {
        const { accountId } = req.params;
        try {
            const orders = await OrderDetails.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'order_info',
                    },
                },
                { $unwind: '$order_info' },

                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'order_info.account_id',
                        foreignField: '_id',
                        as: 'account_info',
                    },
                },
                { $unwind: '$account_info' },
                {
                    $match: { 'account_info._id': new ObjectId(accountId) }
                },
                {
                    $lookup: {
                        from: 'product_size',
                        localField: 'product_size_id',
                        foreignField: '_id',
                        as: 'product_size_info',
                    },
                },
                { $unwind: '$product_size_info' },
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
                        from: 'products',
                        localField: 'product_size_info.product_id',
                        foreignField: '_id',
                        as: 'product_info',
                    },
                },
                { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } },
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
                        createdAt: { $first: '$createdAt' },
                        order_id: { $first: '$order_info._id' },
                        product_size_name: { $first: '$product_size_name_info.name' },
                        product_name: { $first: '$product_info.name' },
                        product_id: { $first: '$product_info._id' },
                        price: { $first: '$product_info.price' },
                        images: { $push: '$product_images_info' },
                        discount: { $first: '$product_discount_info.percent' },
                        expired_day: { $first: '$product_discount_info.expired_at' },
                        product_size_id: { $first: '$product_size_info._id' },
                        quantity: { $first: '$product_size_info.quantity' },
                        cartQuantity: { $first: '$quantity' },
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
                        discount: {
                            $cond: {
                                if: { $lt: ['$expired_day', '$$NOW'] },
                                then: null,
                                else: '$discount'
                            }
                        },
                    }
                },

                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        order_id: 1,
                        product_size_name: 1,
                        product_name: 1,
                        product_id: 1,
                        price: 1,
                        discount: 1,
                        expired_day: 1,
                        image: 1,
                        product_size_id: 1,
                        quantity: 1,
                        cartQuantity: 1,
                    },
                }
            ]);

            res.status(200).json({ data: orders });
        } catch (error) {
            next(error);
        }
    }
    updateOrderReason(req, res, next) {
        const { refund_reason } = req.params.refund_reason;
        const { cancel_reason } = req.params.cancel_reason;
        const { reject_reason } = req.params.reject_reason;
        if (refund_reason) {
            Orders.findByIdAndUpdate(req.params.orderId, { refund_reason: req.params.refund_reason, bank: req.params.bank }, { new: true })
                .populate('account_id', 'username')
                .then((order) => {
                    if (!order) return res.status(404).json({ message: 'order not found' });
                    res.status(200).json(order);
                })
                .catch((err) => {
                    res.status(500).json({ error: err.message });
                });
        }
        else if (cancel_reason) {
            Orders.findByIdAndUpdate(req.params.orderId, { cancel_reason: req.params.cancel_reason }, { new: true })
                .populate('account_id', 'username')
                .then((order) => {
                    if (!order) return res.status(404).json({ message: 'order not found' });
                    res.status(200).json(order);
                })
                .catch((err) => {
                    res.status(500).json({ error: err.message });
                });
        } else if (reject_reason) {
            Orders.findByIdAndUpdate(req.params.orderId, { reject_reason: req.params.reject_reason }, { new: true })
                .populate('account_id', 'username')
                .then((order) => {
                    if (!order) return res.status(404).json({ message: 'order not found' });
                    res.status(200).json(order);
                })
                .catch((err) => {
                    res.status(500).json({ error: err.message });
                });
        }
    }
    async uploadOrderImg(req, res) {
        try {
            let fileArray; //mảng chứa các file hình
            const id = new ObjectId(req.params.id);
            if (req.files) {
                fileArray = Array.isArray(req.files)
                    ? req.files
                    : Object.values(req.files);
            }

            if (fileArray.length === 0) {
                return res.status(200).json({ success: true, imageUrls: [] });
            }
            const uploadResult = await uploadOrderImages(fileArray, id);
            const imageUrls = uploadResult.detail
                .filter((item) => item.status === "success")
                .map((item) => `/images/order/${id}/${item.path}`);

            res.status(200).json({ success: true, imageUrls });
        } catch (error) {
            console.error("Error in uploadOrderImg:", error);
            res.status(500).json({ message: "Error uploading images", error });
        }
    }
    async getOrderImg(req, res) {
        let { id } = req.params;
        let result = [];
        let orderImgs = await ImageOrder.find({ order_id: id });
        if (orderImgs.length > 0) {
            result = orderImgs.map((e) => {
                return `/images/order/${id}/${e._id}${e.file_extension}`;
            });
        }

        res.json(result);
    }
    paidOrder(req, res, next) {
        Orders.create(req.body)
            .then(async (order) => {
                const { orderItems } = req.body;
                const orderDetailsData = orderItems.map(item => ({
                    order_id: order._id,
                    product_size_id: item.product_size_id,
                    quantity: Number(item.quantity),
                    discount: Number(item.discount)
                }));
                console.log(orderDetailsData);
                const orderDetails = await OrderDetails.create(orderDetailsData);
                await Orders.findByIdAndUpdate(order._id, { status: 'Paid' }, { new: true })
                res.status(201).json({
                    orderDetails,
                });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: err.message });
            });
    }
}

module.exports = new OrderController;