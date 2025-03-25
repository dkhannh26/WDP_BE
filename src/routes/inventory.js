var express = require("express");
const { getInventory } = require("../controllers/inventory.controller");
var inventoryRouter = express.Router();

inventoryRouter.get('/', getInventory);

module.exports = inventoryRouter;