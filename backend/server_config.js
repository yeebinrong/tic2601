/* -------------------------------------------------------------------------- */
//                  ######## SERVER CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */

const secure = require('secure-env')
const { Pool } = require('pg')
const AWS = require('aws-sdk')

// Retrieve environment variables from .env
global.env = secure({secret: process.env.ENV_PASS})

const EMAIL_USER = global.env.EMAIL_USER
const EMAIL_PASS = global.env.EMAIL_PASS
const SIGN_SECRET = global.env.SIGN_SECRET
const POSTGRES_USER = global.env.POSTGRES_USER
const POSTGRES_HOST = global.env.POSTGRES_HOST
const POSTGRES_DATABASE = global.env.POSTGRES_DATABASE
const POSTGRES_PASS = global.env.POSTGRES_PASS
const POSTGRES_PORT = global.env.POSTGRES_PORT

//######## POSTGRESQL ########
const POOL = new Pool({
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DATABASE,
    password: POSTGRES_PASS,
    port: POSTGRES_PORT,
})

//######## DIGITAL OCEAN ########
const DIGITAL_OCEAN_ENDPOINT = new AWS.Endpoint(global.env.DIGITALOCEAN_ENDPOINT)

const DIGITAL_OCEAN_SPACE = new AWS.S3({
    endpoint: DIGITAL_OCEAN_ENDPOINT,
    accessKeyId: global.env.DIGITALOCEAN_ACCESS_KEY,
    secretAccessKey: global.env.DIGITALOCEAN_SECRET_ACCESS_KEY
})

//######## OTHERS ########
// Reads the file using fs and returns the buffer as a promise
const READ_FILE = (file) => new Promise((resolve, reject) => {
    fs.readFile(file, (err, buffer) => {
        if (err == null) {
            resolve(buffer)
        } else {
            reject("READ_FILE err: ", err)
        }
    })
})

const UNLINK_ALL_FILES = (directory) => new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
        if (err) reject("UNLINK_ALL_FILES Function: ", err)
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) reject("UNLINK_ALL_FILES Function: ", err)
          });
        }
        resolve()
    });
})

// Tests the digital ocean spaces server
const CHECK_DIGITAL_OCEAN_KEYS = () => new Promise((resolve, reject) => {
    if (!!global.env.DIGITALOCEAN_ACCESS_KEY && !!global.env.DIGITALOCEAN_SECRET_ACCESS_KEY) {
        console.info("Digital Ocean access keys found...")
        resolve()
    }
    else
        reject('Digital Ocean access keys is not found.')
})

// Tests the PostgreSQL server
const CHECK_POSTGRES_CONN = () => {
    try {
        return POOL.connect()
        .then ((conn) => {
            conn.query('SELECT NOW()', () => {
                console.log('PostgreSQL server is working.')
                conn.end();
              })
        })
    } catch (e) {
        return Promise.reject(e)
    }
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    SIGN_SECRET, EMAIL_USER, EMAIL_PASS, POOL, DIGITAL_OCEAN_SPACE, CHECK_DIGITAL_OCEAN_KEYS, CHECK_POSTGRES_CONN, READ_FILE, UNLINK_ALL_FILES
}