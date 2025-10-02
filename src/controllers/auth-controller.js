import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";
import { Roles } from "../generated/prisma/index.js";

export const register = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
        role: Roles.USER,
      },
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.status(201).json({
      message: "User created successfully!",
      data: {
        id: newUser.id,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error while creating user",
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "User doesn't exists",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({
      message: "User loggedIn successfully!",
      data: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error while loggingIn user",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.json({
      message: "User loggedOut successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error while logging out",
    });
  }
};

export const self = async (req, res, next) => {
  try {
    return res.json({
      data: req.user,
      message: "User authenticated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error getting self info",
    });
  }
};
