const express = require('express')//module
const mongoose = require('mongoose')//module
//below refers to mongodb server with database name
const url = 'mongodb://localhost/Learner'
const app = express()//module
//below code is for connectivity of db
mongoose.connect(url, {useNewUrlParser:true})
const con = mongoose.connection

con.on('open', () => {
    console.log('connected...')
})
/**
 * GET: http:/localhost:9000/users //fetch all user data
 * GET: http:/localhost:9000/users/<id> //gets specific data
 * POST: http:/localhost:9000/users
 * PATCH: http:/localhost:9000/users/<id> //updates minor part. Where PUT is for major updates.
 * DELETE: http:/localhost:9000/users/<id>
 */
app.use(express.json())

const alienRouter = require('./routes/users')
app.use('/users',userRouter)

app.listen(9000, () => {
    console.log('Server started')
})