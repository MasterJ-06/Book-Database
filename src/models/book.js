const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    Title: {
        type: String,
        trim: true,
        required: true
    },
    Authors: {
        type: String,
        trim: true,
    },
    Categories: {
        type: String,
        trim: true,
    },
    Publisher: {
        type: String,
        trim: true,
    },
    PublishedDate: {
        type: String,
        trim: true,
    },
    ISBNNumber: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    PageCount: {
        type: String,
        trim: true,
    },
    PrintType: {
        type: String,
        trim: true,
    },
    Language: {
        type: String,
        trim: true,
    },
    Description: {
        type: String,
        trim: true,
    },
    Image: {
        type: String,
        trim: true,
    },
    Borrowed: {
        type: Boolean,
        trim: true,
        default: false
    },
    Name: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
})

const Book = mongoose.model('Book', bookSchema)

module.exports = Book