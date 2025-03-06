const Cart = require('../models/cart');
const Tshirt = require('../models/tshirts');
const Shoes = require('../models/shoes')
const Pant = require('../models/pants');
const Accessories = require('../models/accessories');
const TshirtPantDetail = require('../models/product_size')
const ShoesDetail = require('../models/shoes_size_detail');
const TshirtPantSize = require('../models/pant_shirt_sizes')
const ShoesSize = require('../models/shoes_sizes');
const Image = require('../models/images');
const Account = require('../models/accounts');
const Discounts = require('../models/discounts');
const ProductSize = require('../models/product_size');
const Sizes = require('../models/sizes');
const Product = require('../models/products');
const { default: mongoose } = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const currentTimeInMillis = Date.now();
const currentDate = new Date(currentTimeInMillis);
class CartController {
    async getList(req, res, next) {
        const { accountId } = req.params;
        try {
            const carts = await Cart.aggregate([
                {
                    $match: { account_id: new ObjectId(accountId) }
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
                        product_size_name: { $first: '$product_size_name_info.name' },
                        product_name: { $first: '$product_info.name' },
                        product_id: { $first: '$product_info._id' },
                        price: { $first: '$product_info.price' },
                        images: { $push: '$product_images_info' },
                        discount: { $first: '$product_discount_info.percent' },
                        expired_day: { $first: '$product_discount_info.expired_at' },
                        product_size_id: { $first: '$product_size_info._id' },
                        quantity: { $first: '$product_size_info.quantity' },
                        cartQuantity: { $first: '$quantity' }
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
                        }
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
                        expired_day: 1,
                        image: 1,
                        product_size_id: 1,
                        quantity: 1,
                        cartQuantity: 1,
                    },
                },
                { $sort: { _id: 1 } }
            ]);

            res.status(200).json({ data: carts });
        } catch (error) {
            next(error);
        }
        // Cart.find({ account_id: accountId })
        //     .select('pant_shirt_size_detail_id shoes_size_detail_id accessory_id quantity')
        //     .populate('pant_shirt_size_detail_id')
        //     .populate('shoes_size_detail_id')
        //     .populate('accessory_id')
        //     .then((carts) => {
        //         const shirtImagesPromises = carts.map((cart) => {
        //             return cart.pant_shirt_size_detail_id
        //                 ? Image.findOne({ tshirt_id: cart.pant_shirt_size_detail_id.tshirt_id })
        //                 : null;
        //         });
        //         const shirtsizeTshirtPromises = carts.map((cart) => {
        //             return cart.pant_shirt_size_detail_id
        //                 ? TshirtPantSize.findOne({ _id: cart.pant_shirt_size_detail_id.size_id })
        //                 : null;
        //         });
        //         const shirtPromises = carts.map((cart) => {
        //             return cart.pant_shirt_size_detail_id
        //                 ? Tshirt.findOne({ _id: cart.pant_shirt_size_detail_id.tshirt_id })
        //                 : null;
        //         });
        //         const pantImagesPromises = carts.map((cart) => {
        //             return cart.pant_shirt_size_detail_id
        //                 ? Image.findOne({ pant_id: cart.pant_shirt_size_detail_id.pant_id })
        //                 : null;
        //         });
        //         const pantsizeTshirtPromises = carts.map((cart) => {
        //             return cart.pant_shirt_size_detail_id
        //                 ? TshirtPantSize.findOne({ _id: cart.pant_shirt_size_detail_id.size_id })
        //                 : null;
        //         });
        //         const pantPromises = carts.map((cart) => {
        //             return cart.pant_shirt_size_detail_id
        //                 ? Pant.findOne({ _id: cart.pant_shirt_size_detail_id.pant_id })
        //                 : null;
        //         });
        //         const shoesImagesPromises = carts.map((cart) => {
        //             return cart.shoes_size_detail_id
        //                 ? Image.findOne({ shoes_id: cart.shoes_size_detail_id.shoes_id })
        //                 : null;
        //         });
        //         const shoessizeTshirtPromises = carts.map((cart) => {
        //             return cart.shoes_size_detail_id
        //                 ? ShoesSize.findOne({ _id: cart.shoes_size_detail_id.size_id })
        //                 : null;
        //         });
        //         const shoesPromises = carts.map((cart) => {
        //             return cart.shoes_size_detail_id
        //                 ? Shoes.findOne({ _id: cart.shoes_size_detail_id.shoes_id })
        //                 : null;
        //         });
        //         const accessoryImagesPromises = carts.map((cart) => {
        //             return cart.accessory_id
        //                 ? Image.findOne({ accessory_id: cart.accessory_id })
        //                 : null;
        //         });
        //         // const discountPromises = carts.map((cart, index) => {
        //         //     const discountId = cart.pant_shirt_size_detail_id?.tshirt_id ||
        //         //         cart.pant_shirt_size_detail_id?.pant_id ||
        //         //         cart.shoes_size_detail_id?.shoes_id ||
        //         //         cart.accessory_id?.discount_id || null;
        //         //     return discountId ? Discounts.findById(discountId) : Tshirt.findById(discountId).then((discount) => {
        //         //         return Discounts.findById(discount.discount_id)
        //         //     });
        //         // });
        //         const discountPromises = carts.map(async (cart) => {
        //             let discountId = null;

        //             if (cart.pant_shirt_size_detail_id) {
        //                 const pantShirtDetail = cart.pant_shirt_size_detail_id;

        //                 if (pantShirtDetail.tshirt_id) {
        //                     const tshirt = await Tshirt.findById(pantShirtDetail.tshirt_id);
        //                     discountId = tshirt?.discount_id;
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
        //                 const accessory = await Accessories.findById(cart.accessory_id);
        //                 discountId = accessory?.discount_id;
        //             }

        //             return discountId ? Discounts.findById(discountId) : null;
        //         });

        //         Promise.all([Promise.all(shirtImagesPromises), Promise.all(shirtsizeTshirtPromises), Promise.all(shirtPromises),
        //         Promise.all(shoesImagesPromises), Promise.all(shoessizeTshirtPromises), Promise.all(shoesPromises),
        //         Promise.all(pantImagesPromises), Promise.all(pantsizeTshirtPromises), Promise.all(pantPromises),
        //         Promise.all(accessoryImagesPromises),
        //         Promise.all(discountPromises)])
        //             .then(([shirtImagesPromises, shirtsizeTshirtPromises, shirtPromises,
        //                 shoesImagesPromises, shoessizeTshirtPromises, shoesPromises,
        //                 pantImagesPromises, pantsizeTshirtPromises, pantPromises,
        //                 accessoryImagesPromises,
        //                 discountResults]) => {
        //                 const combinedData = carts.map((cart, index) => {
        //                     const cartData = cart.toObject();
        //                     const discountData = discountResults[index];
        //                     // delete cartData.pant_shirt_size_detail_id;
        //                     // delete cartData._id;
        //                     return {
        //                         ...cartData,
        //                         productImage: shirtImagesPromises[index]?.file_extension || shoesImagesPromises[index]?.file_extension || pantImagesPromises[index]?.file_extension || accessoryImagesPromises[index]?.file_extension
        //                             ? {
        //                                 _id: shirtImagesPromises[index]?._id || shoesImagesPromises[index]?._id || pantImagesPromises[index]?._id || accessoryImagesPromises[index]?._id,
        //                                 file_extension: shirtImagesPromises[index]?.file_extension || shoesImagesPromises[index]?.file_extension || pantImagesPromises[index]?.file_extension || accessoryImagesPromises[index]?.file_extension,
        //                             }
        //                             : null,
        //                         productSize: shirtsizeTshirtPromises[index]?.size_name || shoessizeTshirtPromises[index]?.size_name || pantsizeTshirtPromises[index]?.size_name
        //                             ? {
        //                                 size_name: shirtsizeTshirtPromises[index]?.size_name || shoessizeTshirtPromises[index]?.size_name || pantsizeTshirtPromises[index]?.size_name,
        //                             }
        //                             : null,
        //                         product: {
        //                             name: shirtPromises[index]?.name || shoesPromises[index]?.name || pantPromises[index]?.name || cart.accessory_id?.name || null,
        //                             price:
        //                                 shirtPromises[index]?.price ||
        //                                 shoesPromises[index]?.price ||
        //                                 pantPromises[index]?.price ||
        //                                 cart.accessory_id?.price ||
        //                                 null,
        //                             quantity: cart.pant_shirt_size_detail_id
        //                                 ? cart.pant_shirt_size_detail_id.quantity
        //                                 : (cart.shoes_size_detail_id
        //                                     ? cart.shoes_size_detail_id.quantity
        //                                     : (cart.accessory_id ? cart.accessory_id.quantity : null)),
        //                             // product_id: shirtPromises[index]?._id || shoesPromises[index]?._id || pantPromises[index]?._id || cart.accessory_id?._id || null,
        //                             product_id: cart.pant_shirt_size_detail_id
        //                                 ? (cart.pant_shirt_size_detail_id.tshirt_id || cart.pant_shirt_size_detail_id.pant_id)
        //                                 : (cart.shoes_size_detail_id
        //                                     ? cart.shoes_size_detail_id.shoes_id
        //                                     : (cart.accessory_id ? cart.accessory_id._id : null)),
        //                             discount: discountData ? discountData.percent : null,

        //                         }
        //                     };
        //                 });

        //                 res.status(200).json(combinedData);
        //             })
        //             .catch((error) => {
        //                 res.status(500).json({ error: error.message });
        //             });
        //         // res.status(200).json({ carts });
        //     })
        //     .catch((err) => {
        //         res.status(500).json({ error: err.message });
        //     });
    }
    createCart(req, res, next) {
        Cart.create(req.body)
            .then((cart) => {
                res.status(201).json(cart);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getProductSizeDetails(req, res, next) {
        const { cartId } = req.params;

        const tshirtPromise = TshirtPantDetail.find({ tshirt_id: cartId });
        const pantPromise = TshirtPantDetail.find({ pant_id: cartId });
        const shoesPromise = ShoesDetail.find({ shoes_id: cartId });
        const accessoryPromise = Accessories.find({ _id: cartId });

        Promise.all([tshirtPromise, pantPromise, shoesPromise, accessoryPromise])
            .then(([tshirts, pants, shoes, accessories]) => {
                const productDetails = {
                    tshirts,
                    pants,
                    shoes,
                    accessories
                };
                res.status(200).json(productDetails);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    deleteAllCartByAccountId(req, res, next) {
        const { account_id } = req.body;

        Account.findById(account_id)
            .populate('cart_id')
            .then((account) => {
                if (!account || !account.cart_id.length) {
                    return res.status(404).json({ message: 'No carts found for this account' });
                }

                const cartIds = account.cart_id.map(cart => cart._id);
                Cart.deleteMany({ _id: { $in: cartIds } })
                    .then((result) => {
                        res.status(200).json({
                            message: `${result.deletedCount} carts deleted successfully for account ${account_id}`,
                            deletedCarts: cartIds,
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({ error: err.message });
                    });
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            })
    }
    getCartById(req, res, next) {
        Cart.findById(req.params.cartId)
            .then((cart) => {
                if (!cart) return res.status(404).json({ message: 'cart not found' });
                res.status(200).json(cart);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    updateCartById(req, res, next) {
        const { quantity } = req.body;

        Cart.findByIdAndUpdate(req.params.cartId, { $set: { quantity } }, { new: true })
            .populate('product_size_id')
            .then((cart) => {
                if (!cart) return res.status(404).json({ message: 'Cart not found' });
                const productPromise = cart.product_size_id.product_id
                    ? Product.findOne({ _id: cart.product_size_id.product_id })
                    : null;
                Promise.all([
                    productPromise,
                ])
                    .then(([products]) => {
                        const cartData = cart.toObject();

                        const updatedCart = {
                            ...cartData,
                            product: products ? {
                                name: products.name,
                                price: products.price
                            } : null
                        };

                        res.status(200).json(updatedCart);
                    })
                    .catch((error) => {
                        res.status(500).json({ error: error.message });
                    });
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }

    deleteCartById(req, res, next) {
        Cart.findByIdAndDelete(req.params.cartId)
            .then((cart) => {
                if (!cart) return res.status(404).json({ message: 'cart not found' });
                res.status(200).json(cart);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    deleteAllCartById(req, res, next) {
        const { account_id } = req.params;
        console.log(account_id);
        Cart.deleteMany(account_id)
            .then((cart) => {
                if (!cart) return res.status(404).json({ message: 'cart not found' });
                res.status(200).json(cart);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getCartByAccountId(req, res, next) {
        const { accountId } = req.params;
        // Account.findById(account_id)
        //     .populate('cart_id')
        //     .then((account) => {
        //         if (!account || !account.cart_id.length) {
        //             return res.status(404).json({ message: 'No carts found for this account' });
        //         }

        //         const cartIds = account.cart_id.map(cart => cart._id);


        Cart.find({ account_id: accountId })
            .select('pant_shirt_size_detail_id shoes_size_detail_id accessory_id quantity')
            .populate('pant_shirt_size_detail_id')
            .populate('shoes_size_detail_id')
            .populate('accessory_id')
            .then((carts) => {
                if (!carts.length) {
                    return res.status(404).json({ message: 'No carts found for this account' });
                }
                const shirtImagesPromises = carts.map((cart) => {
                    return cart.pant_shirt_size_detail_id
                        ? Image.findOne({ tshirt_id: cart.pant_shirt_size_detail_id.tshirt_id })
                        : null;
                });
                const shirtsizeTshirtPromises = carts.map((cart) => {
                    return cart.pant_shirt_size_detail_id
                        ? TshirtPantSize.findOne({ _id: cart.pant_shirt_size_detail_id.size_id })
                        : null;
                });
                const shirtPromises = carts.map((cart) => {
                    return cart.pant_shirt_size_detail_id
                        ? Tshirt.findOne({ _id: cart.pant_shirt_size_detail_id.tshirt_id })
                        : null;
                });
                const pantImagesPromises = carts.map((cart) => {
                    return cart.pant_shirt_size_detail_id
                        ? Image.findOne({ pant_id: cart.pant_shirt_size_detail_id.pant_id })
                        : null;
                });
                const pantsizeTshirtPromises = carts.map((cart) => {
                    return cart.pant_shirt_size_detail_id
                        ? TshirtPantSize.findOne({ _id: cart.pant_shirt_size_detail_id.size_id })
                        : null;
                });
                const pantPromises = carts.map((cart) => {
                    return cart.pant_shirt_size_detail_id
                        ? Pant.findOne({ _id: cart.pant_shirt_size_detail_id.pant_id })
                        : null;
                });
                const shoesImagesPromises = carts.map((cart) => {
                    return cart.shoes_size_detail_id
                        ? Image.findOne({ shoes_id: cart.shoes_size_detail_id.shoes_id })
                        : null;
                });
                const shoessizeTshirtPromises = carts.map((cart) => {
                    return cart.shoes_size_detail_id
                        ? ShoesSize.findOne({ _id: cart.shoes_size_detail_id.size_id })
                        : null;
                });
                const shoesPromises = carts.map((cart) => {
                    return cart.shoes_size_detail_id
                        ? Shoes.findOne({ _id: cart.shoes_size_detail_id.shoes_id })
                        : null;
                });
                const accessoryImagesPromises = carts.map((cart) => {
                    return cart.accessory_id
                        ? Image.findOne({ accessory_id: cart.accessory_id })
                        : null;
                });

                Promise.all([
                    Promise.all(shirtImagesPromises),
                    Promise.all(shirtsizeTshirtPromises),
                    Promise.all(shirtPromises),
                    Promise.all(shoesImagesPromises),
                    Promise.all(shoessizeTshirtPromises),
                    Promise.all(shoesPromises),
                    Promise.all(pantImagesPromises),
                    Promise.all(pantsizeTshirtPromises),
                    Promise.all(pantPromises),
                    Promise.all(accessoryImagesPromises)
                ])
                    .then(([shirtImagesPromises, shirtsizeTshirtPromises, shirtPromises,
                        shoesImagesPromises, shoessizeTshirtPromises, shoesPromises,
                        pantImagesPromises, pantsizeTshirtPromises, pantPromises,
                        accessoryImagesPromises]) => {
                        const combinedData = carts.map((cart, index) => {
                            const cartData = cart.toObject();

                            return {
                                ...cartData,
                                productImage: shirtImagesPromises[index]?.file_extension || shoesImagesPromises[index]?.file_extension || pantImagesPromises[index]?.file_extension || accessoryImagesPromises[index]?.file_extension
                                    ? {
                                        _id: shirtImagesPromises[index]?._id || shoesImagesPromises[index]?._id || pantImagesPromises[index]?._id || accessoryImagesPromises[index]?._id,
                                        file_extension: shirtImagesPromises[index]?.file_extension || shoesImagesPromises[index]?.file_extension || pantImagesPromises[index]?.file_extension || accessoryImagesPromises[index]?.file_extension,
                                    }
                                    : null,
                                productSize: shirtsizeTshirtPromises[index]?.size_name || shoessizeTshirtPromises[index]?.size_name || pantsizeTshirtPromises[index]?.size_name
                                    ? {
                                        size_name: shirtsizeTshirtPromises[index]?.size_name || shoessizeTshirtPromises[index]?.size_name || pantsizeTshirtPromises[index]?.size_name,
                                    }
                                    : null,
                                product: {
                                    name: shirtPromises[index]?.name || shoesPromises[index]?.name || pantPromises[index]?.name || cart.accessory_id.name || null,
                                    price: shirtPromises[index]?.price || shoesPromises[index]?.price || pantPromises[index]?.price || cart.accessory_id?.price || null,
                                    quantity: cart.quantity,
                                }
                            };
                        });

                        res.status(200).json(combinedData);
                    })
                    .catch((error) => {
                        res.status(500).json({ error: error.message });
                    });
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
        // })
        // .catch((error) => {
        //     res.status(500).json({ error: error.message });
        // });

    }

    // getDetailId(req, res, next) {
    //     size.find({size_name: size_name})
    //     c TshirtPantDetail.find({tshirt_id: tshirt_id} )
    //     rs
    //         tshirt.filter(item => item.size_id === size_id)
    //         .then((cart) => {
    //             if (!cart) return res.status(404).json({ message: 'cart not found' });
    //             res.status(200).json(cart);
    //         })
    //         .catch((err) => {
    //             res.status(500).json({ error: err.message });
    //         });
    // }
}



module.exports = new CartController;