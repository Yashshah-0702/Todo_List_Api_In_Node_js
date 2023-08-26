const express = require('express')

const router = express.Router()

const AuthController = require('../Controller/auth')

const ValidationController=require('../middleware/is-validation')

const isAuth = require('../middleware/is-Auth')

router.put('/signup',ValidationController.SignupValidation,AuthController.SignUp)

router.post('/login',AuthController.Login)

router.put('/login/:userId',isAuth,AuthController.updateUser)

router.delete('/login/:userId',isAuth,AuthController.deleteUser)

module.exports=router