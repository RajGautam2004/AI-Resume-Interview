/**
 * BACKEND AUTHENTICATION
 * JWT-based authentication system
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRE = "24h";

export function generateToken(userId, email) {
  return jwt.sign(
    {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = decoded;
  next();
}

export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

// Mock user database (replace with real DB in production)
const users = new Map();

export function registerUser(email, password) {
  if (users.has(email)) {
    return { error: "User already exists" };
  }

  const userId = Math.random().toString(36).substr(2, 9);
  users.set(email, { userId, email, password });

  return {
    userId,
    token: generateToken(userId, email),
  };
}

export function loginUser(email, password) {
  const user = users.get(email);

  if (!user || user.password !== password) {
    return { error: "Invalid credentials" };
  }

  return {
    userId: user.userId,
    token: generateToken(user.userId, email),
  };
}
