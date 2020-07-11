const express = require('express')
const app = express()
const mongoose = require('mongoose')
const {MONGOURI} = require('./config/keys')
const PORT = process.env.PORT || 5000

//https://mongoosejs.com/docs/deprecations.html#findandmodify
mongoose.set('useFindAndModify', false);

//Connect with mongodb
mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.on('connected', ()=>{
    console.log('Successfully connected to mongodb')
})
mongoose.connection.on('error', (err)=>{
    console.log('Error connecting to mongodb', err)
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

// app.get('/', (req,res)=>{
//     res.send('Hello World')
// })

if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

//listen on port# PORT
app.listen(PORT, ()=>{
    console.log("Server is running on", PORT)
})