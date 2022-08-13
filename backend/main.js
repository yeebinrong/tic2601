/* -------------------------------------------------------------------------- */
//                     ######## LOAD LIBRARIES ########
/* -------------------------------------------------------------------------- */

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

/* -------------------------------------------------------------------------- */
//             ######## DECLARE VARIABLES & CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */

// Declare the port to run server on
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
// Create an instance of express
const app = express()

/* -------------------------------------------------------------------------- */
//                          ######## REQUESTS ########
/* -------------------------------------------------------------------------- */

// disable cache
app.disable('etag');
// Log incoming requests using morgan
app.use(morgan('combined'))
// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}))
// Parse application/json
app.use(express.json())
// Apply cors headers to resp
app.use(cors())

app.listen(PORT, () => {
    console.info(`Application is listening PORT ${PORT} at ${new Date()}`)
})