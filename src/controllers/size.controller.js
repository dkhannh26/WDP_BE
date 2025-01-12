const PantShirtSizes = require('../models/pant_shirt_sizes');
const ShoesSizes = require('../models/shoes_sizes');

class SizeController {
    getPantShirtSizeList(req, res, next) {
        PantShirtSizes.find({})
            .then((sizes) => {
                res.status(200).json(sizes);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    createPantShirtSize(req, res, next) {
        PantShirtSizes.create(req.body)
            .then((size) => {
                res.status(201).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getPantShirtSizeById(req, res, next) {
        PantShirtSizes.findById(req.params.sizeId)
            .then((size) => {
                if (!size) return res.status(404).json({ message: 'size not found' });
                res.status(200).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    updatePantShirtSizeById(req, res, next) {
        PantShirtSizes.findByIdAndUpdate(req.params.sizeId, req.body, { new: true })
            .then((size) => {
                if (!size) return res.status(404).json({ message: 'size not found' });
                res.status(200).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    deletePantShirtSizeById(req, res, next) {
        PantShirtSizes.findByIdAndDelete(req.params.sizeId)
            .then((size) => {
                if (!size) return res.status(404).json({ message: 'size not found' });
                res.status(200).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }

    getShoesSizeList(req, res, next) {
        ShoesSizes.find({})
            .then((sizes) => {
                res.status(200).json(sizes);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    createShoesSize(req, res, next) {
        ShoesSizes.create(req.body)
            .then((size) => {
                res.status(201).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getShoesSizeById(req, res, next) {
        ShoesSizes.findById(req.params.sizeId)
            .then((size) => {
                if (!size) return res.status(404).json({ message: 'size not found' });
                res.status(200).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    updateShoesSizeById(req, res, next) {
        ShoesSizes.findByIdAndUpdate(req.params.sizeId, req.body, { new: true })
            .then((size) => {
                if (!size) return res.status(404).json({ message: 'size not found' });
                res.status(200).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    deleteShoesSizeById(req, res, next) {
        ShoesSizes.findByIdAndDelete(req.params.sizeId)
            .then((size) => {
                if (!size) return res.status(404).json({ message: 'size not found' });
                res.status(200).json(size);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
}

module.exports = new SizeController;