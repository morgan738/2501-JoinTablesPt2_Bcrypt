const express = require('express')
const app = express()
const {
    client,
    seed
} = require('./db')
app.use(express.json())
app.use('/api', require('./api'))

const init = async () => {
    await client.connect()
    console.log('connected to db')
    await seed()
    const PORT = 3000 || process.env.PORT
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    })
}

init()