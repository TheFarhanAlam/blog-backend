import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId

const postSchema = new mongoose.Schema({
    title: String,
    summary: String,
    content: String,
    image: String, 
    author: {type: String}
}, {
    timestamps: true,
});

const Post = mongoose.model("Post", postSchema);

export default Post;