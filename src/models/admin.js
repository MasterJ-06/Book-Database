const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Book = require('./book')

const adminSchema = new mongoose.Schema({
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
        type: Buffer
    }
}, {
    timestamps: true
})

adminSchema.methods.toJSON = function () {
    const admin = this
    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens
    delete adminObject.refresh
    delete adminObject.avatar

    return adminObject
}

adminSchema.methods.generateAuthToken = async function (params) {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET, { expiresIn: '15m' })

    admin.tokens = admin.tokens.concat({ token })
    admin.refresh = token
    await admin.save()

    return token
}

adminSchema.methods.generateAuthRefreshToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET, { expiresIn: '15m' })

    admin.tokens = admin.tokens.concat({ token })
    await admin.save()

    return token
}

adminSchema.statics.findByCredentials =  async (name, password) => {
    const admin = await Admin.findOne({ name })

    if (!admin) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return admin
}

adminSchema.statics.findByJWT =  async (name) => {
    const admin = await Admin.findOne({ name })

    if (!admin) {
        throw new Error('Unable to login')
    }

    return admin
}

//hash the password before saving the admin
adminSchema.pre('save', async function (next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }

    next()
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin