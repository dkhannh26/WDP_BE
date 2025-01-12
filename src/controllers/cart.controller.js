const Cart = require('../models/cart');
const Tshirt = require('../models/tshirts');
const Shoes = require('../models/shoes')
const Pant = require('../models/pants');
const Accessories = require('../models/accessories');
const TshirtPantDetail = require('../models/pant_shirt_size_detail')
const ShoesDetail = require('../models/shoes_size_detail');
const TshirtPantSize = require('../models/pant_shirt_sizes')
const ShoesSize = require('../models/shoes_sizes');
const Image = require('../models/images');
const Account = require('../models/accounts');
const Discounts = require('../models/discounts')
const { default: mongoose } = require('mongoose');
class CartController {
    getList(req, res, next) {
        const { accountId } = req.params;

        Cart.find({ account_id: accountId })
            .select('pant_shirt_size_detail_id shoes_size_detail_id accessory_id quantity')
            .populate('pant_shirt_size_detail_id')
            .populate('shoes_size_detail_id')
            .populate('accessory_id')
            .then((carts) => {
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
                // const discountPromises = carts.map((cart, index) => {
                //     const discountId = cart.pant_shirt_size_detail_id?.tshirt_id ||
                //         cart.pant_shirt_size_detail_id?.pant_id ||
                //         cart.shoes_size_detail_id?.shoes_id ||
                //         cart.accessory_id?.discount_id || null;
                //     return discountId ? Discounts.findById(discountId) : Tshirt.findById(discountId).then((discount) => {
                //         return Discounts.findById(discount.discount_id)
                //     });
                // });
                const discountPromises = carts.map(async (cart) => {
                    let discountId = null;

                    if (cart.pant_shirt_size_detail_id) {
                        const pantShirtDetail = cart.pant_shirt_size_detail_id;

                        if (pantShirtDetail.tshirt_id) {
                            const tshirt = await Tshirt.findById(pantShirtDetail.tshirt_id);
                            discountId = tshirt?.discount_id;
                        }
                        if (!discountId && pantShirtDetail.pant_id) {
                            const pant = await Pant.findById(pantShirtDetail.pant_id);
                            discountId = pant?.discount_id;
                        }
                    }

                    if (!discountId && cart.shoes_size_detail_id) {
                        const shoesDetail = cart.shoes_size_detail_id;
                        const shoes = await Shoes.findById(shoesDetail.shoes_id);
                        discountId = shoes?.discount_id;
                    }

                    if (!discountId && cart.accessory_id) {
                        const accessory = await Accessories.findById(cart.accessory_id);
                        discountId = accessory?.discount_id;
                    }

                    return discountId ? Discounts.findById(discountId) : null;
                });

                Promise.all([Promise.all(shirtImagesPromises), Promise.all(shirtsizeTshirtPromises), Promise.all(shirtPromises),
                Promise.all(shoesImagesPromises), Promise.all(shoessizeTshirtPromises), Promise.all(shoesPromises),
                Promise.all(pantImagesPromises), Promise.all(pantsizeTshirtPromises), Promise.all(pantPromises),
                Promise.all(accessoryImagesPromises),
                Promise.all(discountPromises)])
                    .then(([shirtImagesPromises, shirtsizeTshirtPromises, shirtPromises,
                        shoesImagesPromises, shoessizeTshirtPromises, shoesPromises,
                        pantImagesPromises, pantsizeTshirtPromises, pantPromises,
                        accessoryImagesPromises,
                        discountResults]) => {
                        const combinedData = carts.map((cart, index) => {
                            const cartData = cart.toObject();
                            const discountData = discountResults[index];
                            // delete cartData.pant_shirt_size_detail_id;
                            // delete cartData._id;
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
                                    name: shirtPromises[index]?.name || shoesPromises[index]?.name || pantPromises[index]?.name || cart.accessory_id?.name || null,
                                    price:
                                        shirtPromises[index]?.price ||
                                        shoesPromises[index]?.price ||
                                        pantPromises[index]?.price ||
                                        cart.accessory_id?.price ||
                                        null,
                                    quantity: cart.pant_shirt_size_detail_id
                                        ? cart.pant_shirt_size_detail_id.quantity
                                        : (cart.shoes_size_detail_id
                                            ? cart.shoes_size_detail_id.quantity
                                            : (cart.accessory_id ? cart.accessory_id.quantity : null)),
                                    // product_id: shirtPromises[index]?._id || shoesPromises[index]?._id || pantPromises[index]?._id || cart.accessory_id?._id || null,
                                    product_id: cart.pant_shirt_size_detail_id
                                        ? (cart.pant_shirt_size_detail_id.tshirt_id || cart.pant_shirt_size_detail_id.pant_id)
                                        : (cart.shoes_size_detail_id
                                            ? cart.shoes_size_detail_id.shoes_id
                                            : (cart.accessory_id ? cart.accessory_id._id : null)),
                                    discount: discountData ? discountData.percent : null,

                                }
                            };
                        });

                        res.status(200).json(combinedData);
                    })
                    .catch((error) => {
                        res.status(500).json({ error: error.message });
                    });
                // res.status(200).json({ carts });
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
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
            .populate('shoes_size_detail_id')
            .populate('accessory_id')
            .populate('pant_shirt_size_detail_id')
            .then((cart) => {
                if (!cart) return res.status(404).json({ message: 'Cart not found' });
                const tshirtPromise = cart.pant_shirt_size_detail_id
                    ? Tshirt.findOne({ _id: cart.pant_shirt_size_detail_id.tshirt_id })
                    : null;
                const pantPromise = cart.pant_shirt_size_detail_id
                    ? Pant.findOne({ _id: cart.pant_shirt_size_detail_id.pant_id })
                    : null;
                const shoesPromise = cart.shoes_size_detail_id
                    ? Shoes.findOne({ _id: cart.shoes_size_detail_id.shoes_id })
                    : null;
                const accessoryPromise = cart.accessory_id
                    ? Accessories.findOne({ _id: cart.accessory_id })
                    : null;

                Promise.all([
                    tshirtPromise,
                    pantPromise,
                    shoesPromise,
                    accessoryPromise
                ])
                    .then(([tshirt, pant, shoes, accessory]) => {
                        const cartData = cart.toObject();
                        // delete cartData.pant_shirt_size_detail_id;
                        // delete cartData.shoes_size_detail_id;
                        // delete cartData.accessory_id;

                        const updatedCart = {
                            ...cartData,
                            product: tshirt || pant || shoes || accessory ? {
                                name: (tshirt || pant || shoes || accessory).name,
                                price: (tshirt || pant || shoes || accessory).price
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