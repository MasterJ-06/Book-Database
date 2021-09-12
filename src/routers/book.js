const express = require('express')
const cors = require('cors')
const Book = require('../models/book')
const auth = require('../middleware/auth')
const adminauth = require('../middleware/adminauth')
const router = new express.Router()
const ISBNnode = require('node-isbn')

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

//list books with a given name - done
router.get('/books/loans', auth, async (req, res) => {
    try {
        const books = await Book.find({ Name: req.query.Name })

        res.setHeader('Access-Control-Allow-Origin', process.env.SERVER)
        res.send(books)
    } catch (e) {
        res.status(500).send()
    }
})

//list borrowed books - done
router.get('/books/borrowed', adminauth, async (req, res) => {
    try {
        const books = await Book.find({ Borrowed: true})

        res.send(books)
    } catch (e) {
        res.status(500).send()
    }
})

//create books - done
router.post('/books', adminauth,  async (req, res) => {
    if (!req.body.ISBN) {
        throw new Error('Please provide an ISBN number')
    }
    ISBNnode.resolve(req.body.ISBN, { timeout: 15000 }, async function (err, response) {
        if (err) {
            throw new Error('Book not found' + err)
        }
        const mySentence = response.title;
        const words = mySentence.split(" ");

        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }

        words.join(" ");
        const book = new Book({
            Title: words,
            Authors: response.authors.toString(),
            Categories: response.categories.toString(),
            Publisher: response.publisher,
            PublishedDate: response.publishedDate,
            ISBNNumber: req.body.ISBN,
            PageCount: response.pageCount,
            PrintType: response.printType,
            Language: response.language,
            Description: response.description,
            Image: response.imageLinks.thumbnail
        })
        try {
            await book.save()
            res.status(201).send(book)
        } catch (e) {
            res.status(400).send(e)
        }
    })
})

//create dvds - done
router.post('/books/dvds', adminauth,  async (req, res) => {
    const mySentence = response.title;
    const words = mySentence.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    words.join(" ");
    const book = new Book({
        Title: words,
        Authors: req.body.authors,
        Publisher: req.body.publisher,
        PublishedDate: req.body.publishedDate,
        ISBNNumber: req.body.ISBN,
        PageCount: req.body.pageCount,
        PrintType: req.body.printType,
        Categories: req.body.categories,
        Language: req.body.language,
        Description: req.body.description,
        Image: req.body.thumbnail
    })
    try {
        await book.save()
        res.status(201).send(book)
    } catch (e) {
        res.status(400).send(e)
    }
})

//read books - done
router.get('/books', async (req, res) => {
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

        const mySentence = req.query.Title;
        const words = mySentence.split(" ");

        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }

        words.join(" ");

        const book = await Book.findOne({ Title: words })
    
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
router.patch('/books/update', cors(), auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['Name', 'Borrowed', 'Status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const book = await Book.findOne({ ISBNNumber: req.query.ISBNNumber })

        if (!book) {
            return res.status(404).send()
        }
        
        if (req.body.Status == "Borrow") {
            if (book.Borrowed == true) {
                return res.status(200).send({ error: 'That book has already been borrowed!' })
            }
        }

        if (req.body.Status == "Return") {
            if (req.body.Name !== book.Name) {
                return res.status(200).send({ error: 'You do not have permission to return that book!' })
            }
        }

        updates.forEach((update) => book[update] = req.body[update])
        await Book.updateOne({ ISBNNumber: req.query.ISBNNumber }, { Name: ''})
        await book.save()

        res.send(book)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete book - done
router.delete('/books/ISBN', adminauth, async (req, res) => {
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