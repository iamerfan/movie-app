const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const queryString = require('query-string')
const routes = require('./routes.js')
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express()

dotenv.config()

const PORT = process.env.PORT || 4000
const apiKey = process.env.TMDB_APIKEY

app.use(express.json())
app.use(express.static(path.resolve(__dirname, './build')))
app.use('/uploads', express.static('uploads'))
app.use('/user', routes)
app.use(
   '/api',
   createProxyMiddleware({
      logLevel: 'silent',
      target: `http://api.themoviedb.org/3/`,
      changeOrigin: true,
      pathRewrite: (path, req) => {
         let newQuery = { api_key: apiKey, language: 'en-US', ...req.query }
         if (path.includes('/images')) newQuery = { api_key: apiKey, ...req.query }
         let newPath = path.replace(/^\/api/, '')
         newPath = `${newPath.split('?')[0]}?${queryString.stringify(newQuery)}`
         return newPath
      },
   }),
)
app.use(
   '/image',
   createProxyMiddleware({
      logLevel: 'silent',
      target: `https://image.tmdb.org/t/p/`,
      changeOrigin: true,
      pathRewrite: {
         '^/image': '',
      },
   }),
   cors({
      origin: `localhost:${PORT}`,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke
   }),
)

// // All other GET requests not handled before will return our React app
// app.get('*', (req, res) => {
//    res.sendFile(path.resolve(__dirname, './build', 'index.html'));
// });
app.use(cors())
app.listen(PORT, () => console.log('Connected On Port :', PORT))
