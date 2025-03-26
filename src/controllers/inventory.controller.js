const Product_size = require("../models/product_size");
const Products = require("../models/products");

const getInventory = async (req, res) => {
    try {
        const products = await Products.find({ deleted_at: false }).lean().exec();

        const productsWithSizes = await Promise.all(
            products.map(async (product) => {
                const productSizes = await Product_size.find({
                    product_id: product._id,
                })
                    .populate("size_id")
                    .lean()
                    .exec();

                product.sizes = productSizes.map((ps) => ({
                    size_id: ps.size_id._id,
                    size_name: ps.size_id.name,
                    quantity: ps.quantity,
                }));

                return product;
            })
        );

        res.json(productsWithSizes);
    } catch (error) {
        console.error("Error fetching products with sizes:", error);
        throw error;
    }
};

// Example usage
// (async () => {
//     try {
//         const result = await getInventory();
//         console.log(JSON.stringify(result, null, 2));
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();

module.exports = { getInventory };
