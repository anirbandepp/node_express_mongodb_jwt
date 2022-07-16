const router = require("express").Router();
const Customer = require("../models/CustomerModel");
const auth = require("../middleware/auth");

router.post("/", async (req, res) => {

    try {
        const { name } = req.body;

        const newCustomer = new Customer({
            name
        });

        const savedCustomer = await newCustomer.save();

        res.json(savedCustomer);
        console.log(cookie);

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

router.get("/", async (req, res) => {

    try {
        const customers = await Customer.find();
        res.json(customers);

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

module.exports = router;