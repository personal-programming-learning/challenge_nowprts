import * as jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";

export class AuthMiddleware {

  constructor() {
  }

  /**
   * Realiza la autorización
   */
  public auth = (req: any, res: Response, next: NextFunction) => {

    let jwtToken = req.header('Authorization');
    if (!jwtToken) return res.status(401).json({ err: 'Token not found' });
  
    try {
      let payload = jwt.verify(jwtToken, process.env.SECRET_KEY_JWT_API!);
      req.user = payload;
      next();
    } catch (error) {
      res.status(400).json('Invalid token');
    }
  }
}

export class TokenFormMiddleware {

  constructor() {
  }

  /**
   * Realiza la autorización
   */
  public authForm = (req: any, res: Response, next: NextFunction) => {

    let jwtToken = req.header('Authorization');
    if (!jwtToken) return res.status(401).json({ err: 'Token not found' });
  
    try {
      let payload = jwt.verify(jwtToken, process.env.SECRET_KEY_JWT_API_FORM!);
      req.form = payload;
      next();
    } catch (error) {
      console.log(error);
      res.status(400).json('Invalid token');
    }
  }
}