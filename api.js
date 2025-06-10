const express = require('express')
const app = express.Router()
const {
    fetchUsers,
    fetchFavorites,
    fetchProducts,
    createFavorite,
    deleteFavorite
} = require('./db')

app.get('/users', async(req,res,next) => {
    try {
        res.send(await fetchUsers())
    } catch (error) {
        next(error)
    }
})

app.get('/favorites', async(req,res,next) => {
    try {
        res.send(await fetchFavorites())
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

app.post('/favorites', async(req,res,next) => {
    try {
        res.send(await createFavorite(req.body))
    } catch (error) {
        next(error)
    }
})

app.delete('/favorites/:fav_id/user/:user_id', async(req,res,next) => {
    try {
        console.log({id: req.params.fav_id, user_id: req.params.user_id})
        /*
        {
        favorite: "",
        user_id: ""
        }
        */
        await deleteFavorite({id: req.params.fav_id, user_id: req.params.user_id})
        res.sendStatus(201)
    } catch (error) {
        next(error)
    }
})

module.exports = app