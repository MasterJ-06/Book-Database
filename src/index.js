const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const bookRouter = require('./routers/book')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(function (req, res, next) {

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
app.use(userRouter)
app.use(bookRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})