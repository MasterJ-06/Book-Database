const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Book = require('./book')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    refresh: {
        type: String,
        required: false
    },
    avatar: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.refresh
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function (params) {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '15m' })

    user.tokens = user.tokens.concat({ token })
    user.refresh = token
    await user.save()

    return token
}

userSchema.methods.generateAuthRefreshToken = async function (jsonWebToken) {
    const user = await User.findOne({ jsonWebToken })

    if (!user) {
        throw new Error('Unable to login')
    }
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '15m' })
    console.log(token)
    user.refresh = token
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials =  async (name, password) => {
    const user = await User.findOne({ name })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.statics.findByJWT =  async (refresh) => {
    const user = await User.findOne({ refresh })

    if (!user) {
        throw new Error('Unable to login')
    }

    return user
}

//hash the password before saving the user
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User