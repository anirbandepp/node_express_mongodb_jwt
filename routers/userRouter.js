const router = require("express").Router();
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register 
router.post("/", async (req, res) => {

    try {
        const { email, password, passwordVerify } = req.body;

        // validations
        if (!email || !password || !passwordVerify)
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });

        if (password.length < 6)
            return res
                .status(400)
                .json({ errorMessage: "Please enter password atleast 6 characters." });

        if (password !== passwordVerify)
            return res
                .status(400)
                .json({ errorMessage: "Please enter the same password twice." });

        const existingUser = await User.findOne({ email: email });

        if (existingUser)
            return res
                .status(400)
                .json({ errorMessage: "An account with this email already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // save a new user account to the database
        const newUser = new User({
            email, passwordHash
        });

        const savedUser = await newUser.save();

        // sign the token
        const token = jwt.sign({
            user: savedUser._id
        }, process.env.JWT_SECRET_KEY);

        // send the token in a http-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).send();

        res.json({ "token": token });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        // validations
        if (!email || !password)
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });

        const existingUser = await User.findOne({ email: email });
        if (!existingUser)
            return res.status(401).json({ errorMessage: "wrong email or password." });

        const passwordCorrect = await bcrypt.compare(
            password,
            existingUser.passwordHash
        );
        if (!passwordCorrect)
            return res.status(401).json({ errorMessage: "wrong email or password." });

        // sign the token
        const token = jwt.sign({
            user: existingUser._id
        }, process.env.JWT_SECRET_KEY);

        // send the token in a http-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).send();

        res.json({ "token": token });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
})

// logout the user
router.get("/logout", (req, res) => {

    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0)
    }).send();
});

// Login check middleware
router.post("/loggedin", async (req, res) => {

    try {
        const token = req.body.usertoken;
        if (!token) res.json(false);

        jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.send(true);

    } catch (err) {
        res.json(false);
    }
});

module.exports = router;