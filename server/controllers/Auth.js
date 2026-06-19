const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.auth = async (req, res) => {
    try{
        // get token from the cookie:
        const {token} = req.cookies;

        // return if token does not exist:
        if(!token){
            return res.json(
                {
                    msg: "Token does not exist",
                }
            );
        }

        // verify the token:
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // return if token is invalid:
        if(!verified){
            return res.json({
                msg: "Token verification failed",
            });
        }

        // check if user exists:
        const user = await User.findById(verified.id);
        console.log(user);
        // return if user does not exist:
        if(!user){
            return res.json(
                {
                    msg: "User does not exist",
                }
            );
        }

        // return if user exists:
        return res.json(
            {
                msg: "User exists",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                }
            }
        );
    }
    catch(err){
        console.log(err);
        res.status(500).json(
            {
                msg: "Error authenticating user",
            }
        );
    }
};

exports.login = async (req, res) => {
    try{
        // get data from req ki body:
        const { email, password } = req.body;

        // validate the data:
        if(!email || !password){
            return res.status(400).json({msg: "All fields are required"});
        }

        // check if user exists:
        const user = await User.findOne({
            email
        });

        if(!user){
            return res.status(400).json({msg: "User does not exist"});
        }

        // check if password is correct:
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'});
            user.token = token;
            user.password = undefined;
            
            // create cookie and send response:
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }
            res.cookie('token', token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User logged in successfully"
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message: "Invalid Password."
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json(
            {
                msg: "Error logging in",
            }
        );
    }
};

exports.signup = async (req, res) => {
    try{
        // get data from req ki body:
        const { username, email, password, confirmPassword } = req.body;

        // validate the data:
        if(!username || !email || !password || !confirmPassword){
            return res.status(400).json({msg: "All fields are required"});
        }

        // check if user already exists:
        const user = await User.findOne({
            email
        });

        if(user){
            return res.status(400).json({msg: "User already exists"});
        }

        if(password !== confirmPassword){
            return res.status(400).json({msg: "Passwords do not match"});
        }

        // hash the password:
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user:

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // send the response:
        res.status(201).json(
            {
                msg: "User created successfully",
            }
        );
    }
    catch(err){
        console.log(err);
        res.status(500).json({msg: "Error creating user"});
    }
};


exports.logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ msg: "Logged out successfully" });
};