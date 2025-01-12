const DiscountModel = require('../models/discounts')

class DiscountController {
    getList(req, res, next) {
        DiscountModel.find({})
            .then(discounts => {
                res.json(discounts)
            })
            .catch(error => {
                console.log(error)
            })
    }

    create(req, res, next) {
        DiscountModel.create(req.body)
            .then(() => {
                res.send('Create discount successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }

    getById(req, res, next) {
        DiscountModel.findById(req.params.id)
            .then(discount => {
                res.json(discount)
            })
            .catch(error => {
                console.log(error)
            })
    }

    update(req, res, next) {
        DiscountModel.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.send('Update discount successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }

    delete(req, res, next) {
        DiscountModel.deleteOne({ _id: req.params.id })
            .then(() => {
                res.send('Delete discount successfully')
            })
            .catch(error => {
                console.log(error)
            })
    }
}

module.exports = new DiscountController

