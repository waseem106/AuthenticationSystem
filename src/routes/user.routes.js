import { Router } from "express";
import verifyJwt from "../middleware/auth.js";
import roleBaseAccess from "../middleware/roleBaseAcces.js";


import { upload } from "../middleware/multer.js";
import { loginUser,logoutUser,registerUser,updateUser,getAllUsers,deleteUser,getUser,refreshAccessToken } from "../controllers/user.controller.js";


const router = Router()
router.route('/registerUser').post(upload.single('image'),registerUser)
router.route('/loginUser').post(loginUser)
router.route('/logout').post(verifyJwt,logoutUser)
router.route('/updateUser/:userId').post(verifyJwt,upload.single('profilePicture'),updateUser)
router.route('/getAllUsers').post(verifyJwt,roleBaseAccess(["admin"]),getAllUsers)
// router.route('/getAllUsers').post(getAllUsers)
router.route('/deleteUser/:userId').delete(verifyJwt,roleBaseAccess(["admin"]),deleteUser)
router.route('/getUser/:userId').get(verifyJwt,roleBaseAccess(["admin"]),getUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router