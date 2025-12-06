import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  console.log("Auth middleware - checking authorization:", {
    hasAuthHeader: !!authHeader,
    authHeaderPreview: authHeader ? authHeader.substring(0, 20) + "..." : "none"
  });
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Auth failed: No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    req.userId = decoded.userId;
    req.email = decoded.email;
    console.log("Auth successful for user:", decoded.email);
    next();
  } catch (err) {
    console.log("Auth failed: Invalid token", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
