const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/fav_products')
const {v4} = require('uuid')
const uuidv4 = v4
const bcrypt = require('bcrypt')

const createProduct = async (product) => {
    const SQL = `
        INSERT INTO products(id, name)
        VALUES($1, $2)
        RETURNING *
    `
    const response = await client.query(SQL, [uuidv4(), product.name])
    return response.rows[0]
}

const createUser = async(user) => {
    if(!user.username.trim() || !user.password.trim()){
        throw Error('must have username and password')
    }
    user.password = await bcrypt.hash(user.password, 5)
    const SQL = `
        INSERT INTO users(id, username, password)
        VALUES ($1, $2, $3)
        RETURNING *
    `
    const response = await client.query(SQL, [uuidv4(), user.username, user.password])
    return response.rows[0]
}

const createFavorite = async (favorite) => {
    const SQL = `
        INSERT INTO favorites(id, product_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
    `
    const response = await client.query(SQL, [uuidv4(), favorite.product_id, favorite.user_id])
    return response.rows[0]
}

const fetchUsers = async() => {
    const SQL = `
        SELECT *
        FROM users
    `
    const response = await client.query(SQL)
    return response.rows
}

const fetchProducts = async() => {
    const SQL = `
        SELECT *
        FROM products
    `
    const response = await client.query(SQL)
    return response.rows
}

const fetchFavorites = async() => {
    const SQL = `
        SELECT *
        FROM favorites
    `
    const response = await client.query(SQL)
    return response.rows
}

const deleteFavorite = async(favorite) => {
    const SQL = `
        DELETE from favorites
        WHERE id = $1 and user_id = $2
    `
    await client.query(SQL, [favorite.id, favorite.user_id])
}

const seed = async () => {
    const SQL = `
        DROP TABLE IF EXISTS favorites;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS products;

        CREATE TABLE users(
            id UUID PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL
        );
        CREATE TABLE products(
            id UUID PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        );
        CREATE TABLE favorites(
            id UUID PRIMARY KEY,
            product_id UUID REFERENCES products(id) NOT NULL,
            user_id UUID REFERENCES users(id) NOT NULL,
            CONSTRAINT product_and_user_id UNIQUE(product_id, user_id)
        );

    `
    await client.query(SQL)
    const [car, protein, aquaphor] = await Promise.all([
        createProduct({name:'car'}),
        createProduct({name:'protein powder'}),
        createProduct({name: 'aquaphor'})
    ])

    const [ethyl, rowan, morgan] = await Promise.all([
        createUser({username: 'ethyl', password: '1234'}),
        createUser({username: 'rowan', password: 'rowniskewl'}),
        createUser({username: 'morgan', password: 'morganiskewler'}),
    ])

    await Promise.all([
        createFavorite({user_id: ethyl.id, product_id: aquaphor.id}),
        createFavorite({user_id: rowan.id, product_id: aquaphor.id})
    ])

    console.log('created tables and seeded data')
}

module.exports = {
    seed,
    client,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    createFavorite,
    deleteFavorite
}