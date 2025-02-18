require("dotenv").config();
var express = require("express");
const PayOS = require("@payos/node");
var payOSRouter = express.Router();
const payos = new PayOS(
    process.env.CLIENT_ID,
    process.env.API_KEY,
    process.env.CHECK_SUM
);
const YOUR_DOMAIN = "http://localhost:3001";
payOSRouter.post("/create-payment-link", async (req, res) => {
    const { amount, bankCode, language, name, address, phone } = req.body;
    let type = 'OK';
    const order = {
        amount: amount,
        description: `${name}`,
        orderCode: Date.now() % 9007199254740991,
        returnUrl: `${YOUR_DOMAIN}/customer/payment?type=${type}&voucherTotal=${amount}&address=${address}&phone=${phone}`,
        cancelUrl: `${YOUR_DOMAIN}/customer`,
    };
    const paymentLink = await payos.createPaymentLink(order);
    res.json(paymentLink.checkoutUrl)
})

module.exports = payOSRouter;