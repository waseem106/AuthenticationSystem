import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookie?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({ error: "Unauthorized Access" });
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodeToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(400).json({ aunthorizeAccess: "Invalid access token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ authError: "Authorization Error" });
  }
};

export default verifyJwt;
