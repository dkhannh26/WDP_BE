const Vouchers = require('../models/vouchers');

class voucherController {
    getList(req, res, next) {
        Vouchers.find({})
            .then((vouchers) => {
                res.status(200).json(vouchers);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    createVoucher(req, res, next) {
        Vouchers.create(req.body)
            .then((voucher) => {
                res.status(201).json(voucher);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getVoucherById(req, res, next) {
        Vouchers.findById(req.params.voucherId)
            .then((voucher) => {
                if (!voucher) return res.status(404).json({ message: 'voucher not found' });
                res.status(200).json(voucher);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    updateVoucherById(req, res, next) {
        Vouchers.findByIdAndUpdate(req.params.voucherId, req.body, { new: true })
            .then((voucher) => {
                if (!voucher) return res.status(404).json({ message: 'voucher not found' });
                res.status(200).json(voucher);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    deleteVoucherById(req, res, next) {
        Vouchers.findByIdAndDelete(req.params.voucherId)
            .then((voucher) => {
                if (!voucher) return res.status(404).json({ message: 'voucher not found' });
                res.status(200).json(voucher);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
}

module.exports = new voucherController;