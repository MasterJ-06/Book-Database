const express = require('express')
const cors = require('cors')
const Book = require('../models/book')
const auth = require('../middleware/auth')
const router = new express.Router()
const ISBNnode = require('node-isbn')

router.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://masterj-library-app.herokuapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache Control, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//list books with a given name - done
router.get('/books/loans', async (req, res) => {
    try {
        const books = await Book.find({ Name: req.query.Name })

        res.setHeader('Access-Control-Allow-Origin', process.env.SERVER)
        res.send(books)
    } catch (e) {
        res.status(500).send()
    }
})

//list borrowed books - done
router.get('/books/borrowed', auth, async (req, res) => {
    try {
        const books = await Book.find({ Borrowed: true})

        res.send(books)
    } catch (e) {
        res.status(500).send()
    }
})

//create books - done
router.post('/books', auth,  async (req, res) => {
    if (!req.body.ISBN) {
        throw new Error('Please provide an ISBN number')
    }
    ISBNnode.resolve(req.body.ISBN, { timeout: 15000 }, async function (err, response) {
        if (err) {
            throw new Error('Book not found' + err)
        }
        const book = new Book({
            Title: response.title,
            Authors: response.authors.toString(),
            Publisher: response.publisher,
            PublishedDate: response.publishedDate,
            ISBNNumber: req.body.ISBN,
            PageCount: response.pageCount,
            PrintType: response.printType,
            Categories: response.categories.toString(),
            Language: response.language
        })
        try {
            await book.save()
            res.status(201).send(book)
        } catch (e) {
            res.status(400).send(e)
        }
    })
})

//read books - done
router.get('/books', auth, async (req, res) => {
    try {
        const books = await Book.find({})

        res.send(books)
    } catch (e) {
        res.status(500).send()
    }
})

//read specific book - done
router.get('/books/ISBN', async (req, res) => {
 if (req.query.filter === 'Title') {
    try {

        const book = await Book.findOne({ Title: req.query.Title })
    
        if (!book) {
            return res.status(404).send()
        }
    
        res.setHeader('Access-Control-Allow-Origin', process.env.SERVER)
        res.send(book)
    } catch (e) {
        res.status(500).send()
    }
 } else if (req.query.filter === 'ISBN') {
    try {

        const book = await Book.findOne({ ISBNNumber: req.query.ISBN })
    
        if (!book) {
            return res.status(404).send()
        }
    
        res.setHeader('Access-Control-Allow-Origin', process.env.SERVER)
        res.send(book)
    } catch (e) {
        res.status(500).send()
    }
 }
})

router.options('/books/update', cors())

//update book - done
router.patch('/books/update', cors(), async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['Name', 'Borrowed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const book = await Book.findOne({ ISBNNumber: req.query.ISBNNumber })

        if (!book) {
            return res.status(404).send()
        }
        
        updates.forEach((update) => book[update] = req.body[update])
        await book.save()

        res.send(book)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete book - done
router.delete('/books/ISBN', auth, async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ ISBNNumber: req.query.ISBN })

        if (!book) {
            return res.status(404).send()
        }

        res.send(book)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router