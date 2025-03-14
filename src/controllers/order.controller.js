const Orders = require('../models/orders');
const OrderDetails = require('../models/order_detail');
const ProductSizes = require('../models/product_size');
const Products = require('../models/products');
const Brands = require('../models/brands');
const { ObjectId } = require('mongodb');

class OrderController {
    getList(req, res, next) {
        Orders.find({})
            .populate('account_id')
            .then((orders) => {
                res.status(200).json(orders);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
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
            status: { $in: ['delivered', 'cancelled', 'shipped'] }
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
            status: { $in: ['processing', 'pending'] }
        })
            .then((orders) => {
                if (!orders) return res.status(404).json({ message: 'orders not found' });
                res.status(200).json(orders);
            })
    }
    //     // getOrderListByAccountId(req, res, next) {
    //     //     Orders.find({
    //     //         // accountId: req.params.accountId,
    //     //         status: { $in: ['delivered', 'processing', 'pending'] }
    //     //     })
    //     //         .then((orders) => {
    //     //             if (!orders) return res.status(404).json({ message: 'orders not found' });
    //     //             // res.status(200).json(orders);
    //     //             const orderIds = orders.map(order => order._id);
    //     //             const orderStatusMap = orders.reduce((acc, order) => {
    //     //                 acc[order._id] = order.status;
    //     //                 return acc;
    //     //             }, {});
    //     //             console.log(orderIds);
    //     //             return OrderDetails.find({ order_id: { $in: orderIds } })
    //     //                 .populate('pant_shirt_size_detail_id')
    //     //                 .populate('shoes_size_detail_id')
    //     //                 .populate('accessory_id')
    //     //                 .then((details) => {
    //     //                     const shirtImagesPromises = details.map((cart) => {
    //     //                         return cart.pant_shirt_size_detail_id
    //     //                             ? Image.findOne({ tshirt_id: cart.pant_shirt_size_detail_id.tshirt_id })
    //     //                             : null;
    //     //                     });
    //     //                     const shirtsizeTshirtPromises = details.map((cart) => {
    //     //                         return cart.pant_shirt_size_detail_id
    //     //                             ? TshirtPantSize.findOne({ _id: cart.pant_shirt_size_detail_id.size_id })
    //     //                             : null;
    //     //                     });
    //     //                     const shirtPromises = details.map((cart) => {
    //     //                         return cart.pant_shirt_size_detail_id
    //     //                             ? Tshirt.findOne({ _id: cart.pant_shirt_size_detail_id.tshirt_id })
    //     //                             : null;
    //     //                     });
    //     //                     const pantImagesPromises = details.map((cart) => {
    //     //                         return cart.pant_shirt_size_detail_id
    //     //                             ? Image.findOne({ pant_id: cart.pant_shirt_size_detail_id.pant_id })
    //     //                             : null;
    //     //                     });
    //     //                     const pantsizeTshirtPromises = details.map((cart) => {
    //     //                         return cart.pant_shirt_size_detail_id
    //     //                             ? TshirtPantSize.findOne({ _id: cart.pant_shirt_size_detail_id.size_id })
    //     //                             : null;
    //     //                     });
    //     //                     const pantPromises = details.map((cart) => {
    //     //                         return cart.pant_shirt_size_detail_id
    //     //                             ? Pant.findOne({ _id: cart.pant_shirt_size_detail_id.pant_id })
    //     //                             : null;
    //     //                     });
    //     //                     const shoesImagesPromises = details.map((cart) => {
    //     //                         return cart.shoes_size_detail_id
    //     //                             ? Image.findOne({ shoes_id: cart.shoes_size_detail_id.shoes_id })
    //     //                             : null;
    //     //                     });
    //     //                     const shoessizeTshirtPromises = details.map((cart) => {
    //     //                         return cart.shoes_size_detail_id
    //     //                             ? ShoesSize.findOne({ _id: cart.shoes_size_detail_id.size_id })
    //     //                             : null;
    //     //                     });
    //     //                     const shoesPromises = details.map((cart) => {
    //     //                         return cart.shoes_size_detail_id
    //     //                             ? Shoes.findOne({ _id: cart.shoes_size_detail_id.shoes_id })
    //     //                             : null;
    //     //                     });
    //     //                     const accessoryImagesPromises = details.map((cart) => {
    //     //                         return cart.accessory_id
    //     //                             ? Image.findOne({ accessory_id: cart.accessory_id })
    //     //                             : null;
    //     //                     });
    //     //                     Promise.all([Promise.all(shirtImagesPromises), Promise.all(shirtsizeTshirtPromises), Promise.all(shirtPromises),
    //     //                     Promise.all(shoesImagesPromises), Promise.all(shoessizeTshirtPromises), Promise.all(shoesPromises),
    //     //                     Promise.all(pantImagesPromises), Promise.all(pantsizeTshirtPromises), Promise.all(pantPromises),
    //     //                     Promise.all(accessoryImagesPromises)])
    //     //                         .then(([shirtImagesPromises, shirtsizeTshirtPromises, shirtPromises,
    //     //                             shoesImagesPromises, shoessizeTshirtPromises, shoesPromises,
    //     //                             pantImagesPromises, pantsizeTshirtPromises, pantPromises,
    //     //                             accessoryImagesPromises]) => {
    //     //                             const combinedData = details.map((cart, index) => {
    //     //                                 const cartData = cart.toObject();
    //     //                                 // delete cartData.pant_shirt_size_detail_id;
    //     //                                 // delete cartData._id;
    //     //                                 return {
    //     //                                     ...cartData,
    //     //                                     status: orderStatusMap[cart.order_id],
    //     //                                     productImage: shirtImagesPromises[index]?.file_extension || shoesImagesPromises[index]?.file_extension || pantImagesPromises[index]?.file_extension || accessoryImagesPromises[index]?.file_extension
    //     //                                         ? {
    //     //                                             _id: shirtImagesPromises[index]?._id || shoesImagesPromises[index]?._id || pantImagesPromises[index]?._id || accessoryImagesPromises[index]?._id,
    //     //                                             file_extension: shirtImagesPromises[index]?.file_extension || shoesImagesPromises[index]?.file_extension || pantImagesPromises[index]?.file_extension || accessoryImagesPromises[index]?.file_extension,
    //     //                                         }
    //     //                                         : null,
    //     //                                     productSize: shirtsizeTshirtPromises[index]?.size_name || shoessizeTshirtPromises[index]?.size_name || pantsizeTshirtPromises[index]?.size_name
    //     //                                         ? {
    //     //                                             size_name: shirtsizeTshirtPromises[index]?.size_name || shoessizeTshirtPromises[index]?.size_name || pantsizeTshirtPromises[index]?.size_name,
    //     //                                         }
    //     //                                         : null,
    //     //                                     product: {
    //     //                                         name: shirtPromises[index]?.name || shoesPromises[index]?.name || pantPromises[index]?.name || cart.accessory_id.name || null,
    //     //                                         price:
    //     //                                             shirtPromises[index] ? shirtPromises[index].price :
    //     //                                                 shoesPromises[index] ? shoesPromises[index].price :
    //     //                                                     pantPromises[index] ? pantPromises[index].price :
    //     //                                                         cart.accessory_id ? cart.accessory_id.price :
    //     //                                                             null,
    //     //                                         quantity: cart.pant_shirt_size_detail_id
    //     //                                             ? (cart.pant_shirt_size_detail_id.quantity)
    //     //                                             : (cart.shoes_size_detail_id
    //     //                                                 ? cart.shoes_size_detail_id.quantity
    //     //                                                 : (cart.accessory_id ? cart.accessory_id.quantity : null)),
    //     //                                         // product_id: cart.pant_shirt_size_detail_id
    //     //                                         //     ? (cart.pant_shirt_size_detail_id.tshirt_id || cart.pant_shirt_size_detail_id.pant_id)
    //     //                                         //     : (cart.shoes_size_detail_id
    //     //                                         //         ? cart.shoes_size_detail_id.shoes_id
    //     //                                         //         : (cart.accessory_id ? cart.accessory_id : null)),
    //     //                                     }
    //     //                                 };
    //     //                             });

    //     //                             res.status(200).json(combinedData);
    //     //                         })
    //     //                         .catch((err) => {
    //     //                             res.status(500).json({ error: err.message });
    //     //                         });
    //     //                 })
    //     //                 .catch((err) => {
    //     //                     res.status(500).json({ error: err.message });
    //     //                 });
    //     //         })
    //     //         .catch((err) => {
    //     //             res.status(500).json({ error: err.message });
    //     //         });
    //     // }
    confirmOrder(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'processing' }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
                let updateData = req.body.updateData;
                const updateProductQuantity = updateData.product_size_id.map((id, index) => {
                    if (id) {
                        return ProductSizes.findById(id)
                            .then((productDetail) => {
                                if (productDetail) {
                                    const newQuantity = productDetail.quantity - updateData.quantities[index];
                                    return ProductSizes.findByIdAndUpdate(
                                        id,
                                        { quantity: newQuantity },
                                        { new: true }
                                    );
                                } else {
                                    throw new Error(`PantShirtSizeDetail with ID ${id} not found`);
                                }
                            });
                    } else {
                        return Promise.resolve();
                    }
                });
                Promise.all(updateProductQuantity)
                    .then(() => {
                        setTimeout(() => {
                            Orders.findByIdAndUpdate(req.params.orderId, { status: 'delivered' }, { new: true })
                                .then(() => {
                                    console.log('order has been delivered');
                                })
                                .catch((err) => {
                                    console.log('Error updating order status to delivered', err);
                                });
                        }, 10000)
                    })
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    cancelOrder(req, res, next) {
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'cancelled' }, { new: true })
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
        Orders.findByIdAndUpdate(req.params.orderId, { status: 'shipped' }, { new: true })
            .populate('account_id', 'username')
            .then((order) => {
                if (!order) return res.status(404).json({ message: 'order not found' });
                res.status(200).json(order);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }

    async getOrderDetails(req, res, next) {
        const { orderId } = req.params
        try {
            const carts = await OrderDetails.aggregate([
                {
                    $match: { order_id: new ObjectId(orderId) }
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'order_info'
                    }
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
                        discount: { $first: '$discount' },
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
                                if: { $gt: ['$expired_day', '$$NOW'] },
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

            res.status(200).json({ data: carts });
        } catch (error) {
            next(error);
        }
        // OrderDetails.find({ order_id: req.params.orderId })
        //     .populate('pant_shirt_size_detail_id')
        //     .populate('shoes_size_detail_id')
        //     .populate('accessory_id')
        //     .then((details) => {
        //         if (!details.length) return res.status(404).json({ message: 'Order details not found' });

        //         const shirtPromises = details.map((product) =>
        //             Tshirt.findOne({ _id: product.pant_shirt_size_detail_id?.tshirt_id })
        //         );
        //         const pantPromises = details.map((product) =>
        //             Pant.findOne({ _id: product.pant_shirt_size_detail_id?.pant_id })
        //         );
        //         const shoesPromises = details.map((shoes) =>
        //             Shoes.findOne({ _id: shoes.shoes_size_detail_id?.shoes_id })
        //         );
        //         const accessoriesPromises = details.map((accessories) =>
        //             Accessory.findOne({ _id: accessories.accessory_id })
        //         );
        //         const imagePromises = details.map((detail) => {


        //             if (detail.pant_shirt_size_detail_id?.tshirt_id) {
        //                 return Image.findOne({ tshirt_id: detail.pant_shirt_size_detail_id.tshirt_id });
        //             } else if (detail.pant_shirt_size_detail_id?.pant_id) {
        //                 return Image.findOne({ pant_id: detail.pant_shirt_size_detail_id.pant_id });
        //             } else if (detail.shoes_size_detail_id) {
        //                 return Image.findOne({ shoes_id: detail.shoes_size_detail_id.shoes_id });
        //             } else if (detail.accessory_id) {
        //                 return Image.findOne({ accessory_id: detail.accessory_id });
        //             }
        //             return null;
        //         });

        //         const shirtSizePromises = details.map((product) =>
        //             TshirtPantSize.findOne({ _id: product.pant_shirt_size_detail_id?.size_id })
        //         );
        //         const pantSizePromises = details.map((product) =>
        //             TshirtPantSize.findOne({ _id: product.pant_shirt_size_detail_id?.size_id })
        //         );
        //         const shoesSizePromises = details.map((shoes) =>
        //             ShoesSize.findOne({ _id: shoes.shoes_size_detail_id?.size_id })
        //         );
        //         const discountPromises = details.map(async (cart) => {
        //             let discountId = null;

        //             if (cart.pant_shirt_size_detail_id) {
        //                 const pantShirtDetail = cart.pant_shirt_size_detail_id;
        //                 console.log(pantShirtDetail);

        //                 if (pantShirtDetail.tshirt_id) {
        //                     const tshirt = await Tshirt.findById(pantShirtDetail.tshirt_id);
        //                     discountId = tshirt?.discount_id;
        //                     console.log(tshirt);
        //                 }
        //                 if (!discountId && pantShirtDetail.pant_id) {
        //                     const pant = await Pant.findById(pantShirtDetail.pant_id);
        //                     discountId = pant?.discount_id;

        //                 }
        //             }

        //             if (!discountId && cart.shoes_size_detail_id) {
        //                 const shoesDetail = cart.shoes_size_detail_id;
        //                 const shoes = await Shoes.findById(shoesDetail.shoes_id);
        //                 discountId = shoes?.discount_id;
        //             }

        //             if (!discountId && cart.accessory_id) {
        //                 const accessory = await Accessory.findById(cart.accessory_id);
        //                 discountId = accessory?.discount_id;
        //             }

        //             return discountId ? Discounts.findById(discountId) : null;
        //         });
        //         Promise.all([
        //             Promise.all(shirtPromises),
        //             Promise.all(pantPromises),
        //             Promise.all(shoesPromises),
        //             Promise.all(accessoriesPromises),
        //             Promise.all(imagePromises),
        //             Promise.all(shirtSizePromises),
        //             Promise.all(pantSizePromises),
        //             Promise.all(shoesSizePromises),
        //             Promise.all(discountPromises)
        //         ])
        //             .then(([shirts, pants, shoes, accessories, images, shirtSizes, pantSizes, shoesSizes, discountResults]) => {
        //                 const combinedData = details.map((detail, index) => {
        //                     console.log('images', images);

        //                     const detailData = detail.toObject();

        //                     const productData = shirts[index] || pants[index] || shoes[index] || accessories[index];
        //                     const productImage = images[index];
        //                     const sizeData = shirtSizes[index] || pantSizes[index] || shoesSizes[index];
        //                     const discountData = discountResults[index];
        //                     return {
        //                         ...detailData,
        //                         product: productData ? {
        //                             id: productData._id,
        //                             name: productData.name,
        //                             price: productData.price,
        //                         } : null,
        //                         productImage: productImage ? {
        //                             id: productImage._id,
        //                             file_extension: productImage.file_extension,
        //                         } : null,
        //                         size: sizeData ? {
        //                             size_name: sizeData.size_name,
        //                         } : null,
        //                         discount: discountData ? discountData.percent : null,
        //                     };
        //                 });

        //                 res.status(200).json(combinedData);
        //             })
        //             .catch((err) => {
        //                 res.status(500).json({ error: err.message });
        //             });
        //     })
        //     .catch((err) => {
        //         res.status(500).json({ error: err.message });
        //     });
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
}

module.exports = new OrderController;