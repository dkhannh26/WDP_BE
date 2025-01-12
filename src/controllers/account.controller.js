const AccountModel = require('../models/accounts');

class accountController {
    getList(req, res, next) {
        AccountModel.find({})
            .then((accounts) => {
                res.status(200).json(accounts);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    create(req, res, next) {
        AccountModel.create(req.body)
            .then((account) => {
                res.status(201).json(account);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    getById(req, res, next) {
        AccountModel.findById(req.params.id)
            .then((account) => {
                if (!account) return res.status(404).json({ message: 'account not found' });
                res.status(200).json(account);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    update(req, res, next) {
        AccountModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then((account) => {
                if (!account) return res.status(404).json({ message: 'account not found' });
                res.status(200).json(account);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
    delete(req, res, next) {
        AccountModel.findByIdAndUpdate(req.params.id, { deleted: true })
            .then((account) => {
                if (!account) return res.status(404).json({ message: 'account not found' });
                res.status(200).json(account);
            })
            .catch((err) => {
                res.status(500).json({ error: err.message });
            });
    }
}

module.exports = new accountController;