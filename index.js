import express from "express"
import cors from "cors"
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "./Models/User.js";
import cookieParser from "cookie-parser";
import Post from "./Models/Post.js";

const app = express();

mongoose.connect("mongodb+srv://thefarhandeveloper:6eGau3TanmGrLLyz@blog-cluster.a6h34hx.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Database Connected");
})
.catch((error) => {  
    console.log(error);
})

app.use(cors({credentials: true, origin: "http://localhost:5173"}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try {
        const exist = await User.findOne({username: username})
        if (exist) {
            return res.status(422).json({message: "User alredy exists"})
        }
        if (!username || !password) {
            return res.status(422).json({message: "Please fill all the feilds"})
        }
        const newUser = new User({
            username: username,
            password: password
        });
        await newUser.save();
        res.json({result: newUser})
    } catch (error) {
        console.log(error);
    }
});
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    try {
        if (!username || !password) {
            return res.json({message: "Please fill all the feilds"})
        }
        const userData = await User.findOne({username: username});
        const matchPassword = await bcrypt.compare(password, userData.password);
        if (matchPassword) {
            const token = await jwt.sign({_id: userData._id}, "heytherethisisthesecretkey");
            res.cookie("token", token);
            res.json({result: userData, token: token})
        }
    } catch (error) {
        console.log(error);
    }
});
app.get("/profile", async (req, res) => {
    const {token} = req.cookies;
    const verify = await jwt.verify(token, "heytherethisisthesecretkey");
    if (verify) {
        const findUser = await User.findOne({_id: verify._id}).select("-password")
        res.json({user: findUser});
    }
});
app.post("/logout", (req, res) => {
    res.clearCookie("token")
    res.json({message: "hello"})
});
app.post("/createpost", async (req, res) => {
    const {title, summary, content, image} = req.body;
    const {token} = req.cookies;
    const response = await jwt.verify(token, "heytherethisisthesecretkey");
    if (response) {
        const foundUser = await User.findOne({_id: response._id});
        try {
            const newPost = new Post({
                title: title,
                summary: summary,
                content: content,
                image: image,
                author: foundUser.username
            });
            await newPost.save();
            res.json({result: newPost})
        } catch (error) {
            console.log(error);
        }
    }
});
app.get("/allPosts", async (req,res) => {
    const posts = await Post.find().sort({createdAt: -1})
    res.json({posts})
});
app.get("/post/:id", async (req, res) => {
    const {id} = req.params;
    try {
        const postInfo = await Post.findOne({_id: id});
        res.json({result : postInfo})
    } catch (error) {
        console.log(error);
    }

});
app.put("/edit/:id", async (req, res) => {
    const {title, summary, content} = req.body;
    console.log(title);
    const {id} = req.params;
    try {
      const updateBlog = await Post.findByIdAndUpdate({_id: id}, {title: title, summary: summary, content: content}, {new: true})
      res.json({updateBlog});
    }
    catch (error) {
        console.log(error);
    }
});

app.listen(8000, () => {
     console.log(`Listening to the port 8000`);
});