import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        bio: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        avatarUrl: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);