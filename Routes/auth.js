const express = require('express')

const router = express.Router()

const AuthController = require('../Controller/auth')

const ValidationController=require('../middleware/is-validation')

router.put('/signup',ValidationController.SignupValidation,AuthController.SignUp)

router.post('/login',AuthController.Login)

module.exports=router