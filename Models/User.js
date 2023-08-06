import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre("save", async function(next) {
    try {
            this.password = await bcrypt.hash(this.password, 10);
            next();
    } catch (error) {
        console.log(error);
    }
} );

const User = mongoose.model("User", userSchema);

export default User;