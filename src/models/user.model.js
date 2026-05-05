import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, /.*/, 'Please provide a valid password'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxLength: 200,
    },
    role: {
        type: String,
        enum: ['freelancer', 'admin'],
        default: 'freelancer',
    },

},  { timestamps: true } );

// Hash password before saving
userSchema.pre('save', async function (next) {

    // only hash if the password Modified ( NOT on every save )
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12)

    this.password = await bcrypt.hash(this.password, salt)
})

// Compare candidate password with hashed one
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

const User = mongoose.model('User', userSchema)
export default User