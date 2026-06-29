const express = require ("express")
const { GetUsers, PostUsers } = require("../controller/userController")


const router =  express.Router()

router.get("/get", GetUsers)
router.get("/post", PostUsers)

module.exports = router;