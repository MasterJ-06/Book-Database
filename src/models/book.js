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
        required: true
    },
    Publisher: {
        type: String,
        trim: true,
        required: true
    },
    PublishedDate: {
        type: String,
        trim: true,
        required: true
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
        required: true
    },
    PrintType: {
        type: String,
        trim: true,
        required: true
    },
    Categories: {
        type: String,
        trim: true,
        required: true
    },
    Language: {
        type: String,
        trim: true,
        required: true
    },
    Description: {
        type: String,
        trim: true,
        required: true
    },
    Image: {
        type: String,
        trim: true,
        required: true
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