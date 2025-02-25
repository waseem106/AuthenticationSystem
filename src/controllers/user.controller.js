import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId, res) => {
  //generate access and refresh token
  //save the genrated refresh token in user document db
  //return the access token and refresh token
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken(user);
    const refreshtoken = await user.generateRefreshToken(user);

    user.refreshToken = refreshtoken;

    try {
      await user.save({ validateBeforeSave: false });
    } catch (err) {
      console.error("Error saving user:", err);
    }

    return { accessToken, refreshtoken };
  } catch (error) {
    throw new Error(
      "Error while generating access and refresh token: " + error.message
    );
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (
      [name, email, password, role].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res
        .status(400)
        .json({ validatingError: "All fields are required" });
    }
    
    if (!email.includes("@")) {
      return res.status(400).json({ emailError: "Enter valid email" });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ existedUserError: "User already exists" });
    }

    // Get the uploaded image URL from Cloudinary
    const imageUrl = req.file?.path;
    if (!imageUrl) {
      return res.status(400).json({ imageUploadError: "Image not uploaded" });
    }

    // Create user in DB
    const user = await User.create({
      name,
      email,
      password,
      role,
      profilePicture: imageUrl,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res.status(400).json({ userRegisterError: "User registration failed" });
    }

    return res.status(200).json({
      message: "User Registered Successfully",
      registeredUser: createdUser,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ registerUserError: "Internal server error" });
  }
};


const loginUser = async (req, res) => {
  //take data
  //check user exist or not
  //if exist than match the entered password and db password
  //if matched generate the access token and refresh token
  //lofin successfully
  try {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
      return res.status(403).json({ validateError: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("email user", user);
      return res.status(400).json({ loginUserError: "User doesnot exist" });
    }

    const checkpassword = await user.isPasswordCorrect(password);
    if (!checkpassword) {
      return res.status(400).json({ passwordValidate: "Incorrect Password" });
    }

    const { accessToken, refreshtoken } = await generateAccessAndRefreshToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select("-password ");

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshtoken, options)
      .json({
        userLoggedIn: "User logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshtoken,
      });
  } catch (error) {
    return res.status(400).json({ loginError: "Login Error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("AccessToken", options)
      .clearCookie("RefreshToken", options)
      .json({ logout: "User logged Out Successfully", user: req.user });
  } catch (error) {
    res.status(400).json({ logoutError: "Error while logging out" });
  }
};
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ invalidUser: "User ID is required" });
    }

    const { name, email } = req.body;
    let profilePicture = req.body.profilePicture; 

    // If a file is uploaded, use its Cloudinary URL
    if (req.file) {
      const cloudImage = await uploadOnCloudinary(req.file.path);
      if (!cloudImage) {
        return res.status(400).json({ cloudinaryImageError: "Image upload failed" });
      }
      profilePicture = cloudImage.url;
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ validateError: "Name and email are required" });
    }

    // Check if the email already exists (excluding the current user)
    const emailExist = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExist) {
      return res.status(400).json({ userExistError: "Email already exists" });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, profilePicture },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ updateUserError: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(400).json({ Users: "There are no users to show" });
    }

    res.status(200).json({ allUsers: users });
  } catch (error) {
    res.status({ getAllUsersError: "Error while getting all users" });
  }
};

const deleteUser=async(req,res)=>{
  try {
    const user=req.params.userId
    if(!user)
    {
      return res.status(400).json({userError:"Invalid user id"})
    }

    const deletedUser=await User.findByIdAndDelete(user)

    if(!deleteUser)
    {
      return res.status(400).json({errorDeletingUser:"Failed to Delete User"})
    }

    res.status(200).json({message:"User deleted successfully",
      deletedUser:deletedUser
  })

  } catch (error) {
    return res.status(400).json({deleteUserError:"Error while deleting the user"})
  }
}

const getUser=async(req,res)=>{
  try {
    const user= req.params.userId
    if(!user)
    {
      return res.status(400).json({userError:"Invalid User"})
    }

    const fetchedUser=await User.findById(user)
    if(!fetchedUser)
    {
      return res.status(400).json({fetchedUser:"Invalid User "})
    }

    res.status(200).json({message:"User fetched succcessfully", fetchedUser:fetchedUser})

  } catch (error) {
    return res.status(400).json({getUserError:"Error while getting user"}) 
  }
}

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    res.status(400).json({
      refreshTokenError: "Invalid refresh token",
    });
  }

  
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      res.status(400).json({
        userError: "Invalid Refresh Token",
      });
    }
    console.log(user);


    if (incomingRefreshToken !== user?.refreshToken) {
      res.status(400).json({
        refreshTokenMatch: "Refresh token is not matched",
      });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json({ success: accessToken, newrefreshToken });
  } catch (error) {
    res.status(400).json({ error: error?.message || "new refreseh token doesnot generated" });
  }
};
export { registerUser, loginUser, logoutUser, updateUser, getAllUsers,deleteUser,getUser,refreshAccessToken };
