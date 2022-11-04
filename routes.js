const express = require('express')
const routes = express.Router()
const multer = require('multer')
const bcrypt = require('bcrypt')
const saltRounds = 10
const storage = multer.diskStorage({
   destination: (req, file, callback) => {
      callback(null, 'uploads')
   },
   filename: (req, file, callback) => {
      callback(null, file.originalname)
   },
})
const upload = multer({ storage: storage })
const mongoose = require('mongoose')
const UserModel = require('./Models/user')

const database =
   'mongodb+srv://vsCode:erfan123@mongocluster.htzk2.mongodb.net/movie-app-db?retryWrites=true&w=majority'

mongoose.connect(database, { useNewUrlParser: true }, err => {
   err ? console.log(err) : console.log('MongoDB Connected!')
})
const db = mongoose.connection

routes.post('/register', async (req, res) => {
   const { email, accessToken, password } = req.body

   if (!email) {
      console.log('email not Exist')
      return res.status(400).send('email not Exist')
   }
   if (!accessToken && !password) {
      console.log('Password or AccessToken not Exist')
      return res.status(400).send('Password or AccessToken not Exist')
   }

   const hashed = await bcrypt.hash(password ? password : accessToken, saltRounds)
   try {
      const createUser = await UserModel.create(
         password
            ? {
                 email: email,
                 password: hashed,
                 watchList: [],
                 likedItems: [],
                 image: '',
              }
            : {
                 email: email,
                 accessToken: hashed,
                 watchList: [],
                 likedItems: [],
                 image: '',
              },
      )
      return res.status(200).send(createUser)
   } catch (error) {
      //if duplicated
      if (error.code === 11000) {
         console.log(error)
         return res.status(400).send('duplicated')
      }
      throw error
   }
})

routes.post('/login', async (req, res) => {
   const { email, accessToken, password } = req.body
   try {
      //check if user already signed up
      const user = await db.collection('users').findOne({ email: req.body.email })
      if (!user && password) return res.status(400).send('user not exist')

      //sign up User via google access token if user not exist
      if (!user && accessToken) {
         const hashed = await bcrypt.hash(accessToken, saltRounds)
         try {
            const createUser = await UserModel.create({
               email: email,
               accessToken: hashed,
               watchList: [],
               likedItems: [],
            })
            return res.status(200).send(createUser)
         } catch (error) {
            //if duplicated
            if (error.code === 11000) {
               return res.status(400).send('duplicated')
            }
            throw error
         }
      }

      //login via email and password
      if (password && !accessToken) {
         const compare = await bcrypt.compare(password, user.password)
         if (compare) return res.status(200).json(user)
         if (!compare) return res.status(400).send('Email or password not correct')
      }

      //login via access Token from google
      if (accessToken && !password) {
         const compare = await bcrypt.compare(accessToken, user.accessToken)
         if (compare) return res.status(200).json(user)
         if (!compare) return res.status(400).send('Access Token not correct')
      }
   } catch (error) {
      console.log(error)
      return res.status(200).send(error)
   }
})

routes.post('/update', async (req, res) => {
   const { watchList, likedItems, email } = req.body
   if (!email) return res.status(400).send('Email Not Exist')
   if (!watchList && !likedItems) return res.status(400).send('No List')
   await db
      .collection('users')
      .findOneAndUpdate(
         { email: email },
         { $set: { watchList: watchList, likedItems: likedItems } },
      )
   const user = await db.collection('users').findOne({ email: email })
   res.status(200).send(user)
})

routes.post('/upload', upload.single('file'), async (req, res) => {
   const getEmail = value => {
      const name = value
      const lastDot = name.lastIndexOf('.')
      const ext = name.substring(0, lastDot)
      return ext
   }
   const email = getEmail(req.file.filename)
   await db
      .collection('users')
      .findOneAndUpdate({ email: email }, { $set: { image: req.file.path } })
   const user = await db.collection('users').findOne({ email: email })
   return res.status(200).send(user)
})

module.exports = routes
