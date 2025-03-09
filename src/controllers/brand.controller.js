const BrandModel = require('../models/brands')
const ProductModel = require('../models/products')

class BrandController {
    getList(req, res, next) {
        BrandModel.find({})
            .then(brands => {
                res.json(brands)
            })
            .catch(error => {
                console.log(error)
            })
    }

    create(req, res, next) {
        BrandModel.create(req.body)
            .then(() => {
                res.send('Create brand successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }

    getById(req, res, next) {
        BrandModel.findById(req.params.id)
            .then(brand => {
                res.json(brand)
            })
            .catch(error => {
                console.log(error)
            })
    }

    update(req, res, next) {
        BrandModel.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.send('Update brand successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }

    async delete(req, res, next) {
        try {
            const productCount = await ProductModel.countDocuments({ brand_id: req.params.id });
            if (productCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete brand because it has associated products'
                });
            }
            console.log(productCount);
            await BrandModel.deleteOne({ _id: req.params.id });
            return res.status(200).json({ message: 'Brand deleted successfully' });
        } catch (error) {
            console.error('Error deleting brand:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new BrandController

