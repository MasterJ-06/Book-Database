const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const Admin = require('../models/admin')
const adminauth = require('../middleware/adminauth')
const router = new express.Router()

router.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://masterj-library-app.herokuapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

router.post('/admins', async (req, res) => {
    const admin = new Admin(req.body)

    try {
        await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).send({ admin, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/admins/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.name, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/admins/refresh', async (req, res) => {
    try {
        const admin = await Admin.findByJWT(req.body.jwt)
        const token = await admin.generateAuthRefreshToken()
        res.send({ admin, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/admins/logout', adminauth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/admins/logoutAll', adminauth, async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/admins/profile', adminauth, async (req, res) => {
    res.send(req.admin)
})

router.patch('/admins/me', adminauth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.admin[update] = req.body[update])
        await req.admin.save()
        res.send(req.admin)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/admins/me', adminauth, async (req, res) => {
    try {
        await req.admin.remove()
        res.send(req.admin)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1073741824
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image.'))
        }

        cb(undefined, true)
    }
})

router.post('/admins/me/avatar', adminauth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.admin.avatar = buffer
    await req.admin.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/admins/me/avatar', adminauth, async (req, res) => {
    req.admin.avatar = undefined
    await req.admin.save()
    res.send()
})

router.get('/admins/:id/avatar', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id)

        if (!admin || !admin.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(admin.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router