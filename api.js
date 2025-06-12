const express = require('express')
const app = express.Router()
const {
    fetchUsers,
    fetchFavorites,
    fetchProducts,
    createFavorite,
    deleteFavorite,
    authenticate,
    findUserByToken
} = require('./db')

const isLoggedIn = async(req,res,next) => {
    /**
     * {
     *  headers: {
     *      authorization: token
     *  }
     * }
     */
    try {
        const user = await findUserByToken(req.headers.authorization)
        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

const isAdmin = (req,res,next) => {
    if(req.user.is_admin){
        next()
    }else{
        const er = Error('must be admin')
        er.status = 401;
        next(er)
    }
} 

app.get('/users', async(req,res,next) => {
    try {
        res.send(await fetchUsers())
    } catch (error) {
        next(error)
    }
})

app.post('/login', async(req,res,next) => {
    try {
        const token = await authenticate(req.body)
        res.send(token)
    } catch (error) {
        next(error)
    }
})

app.get('/me', isLoggedIn, (req,res,next) => {
    try {
        res.send(req.user)
    } catch (error) {
        next(error)
    }
})

app.get('/favorites',isLoggedIn, async(req,res,next) => {
    try {
        res.send(await fetchFavorites(req.user.id))
    } catch (error) {
        next(error)
    }
})

app.get('/products', async(req,res,next) => {
    try {
        res.send(await fetchProducts())
    } catch (error) {
        next(error)
    }
})

app.put('/products/:id', isLoggedIn, isAdmin, (req,res,next) => {
    res.send('created product')
})

app.post('/favorites', async(req,res,next) => {
    try {
        res.send(await createFavorite(req.body))
    } catch (error) {
        next(error)
    }
})

app.delete('/favorites/:fav_id/user/:user_id', async(req,res,next) => {
    try {
        
        await deleteFavorite({id: req.params.fav_id, user_id: req.params.user_id})
        res.sendStatus(201)
    } catch (error) {
        next(error)
    }
})

module.exports = app