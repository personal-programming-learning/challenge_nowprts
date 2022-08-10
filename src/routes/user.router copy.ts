import { Request, Response } from "express";
import { BaseRouter } from "./router";
import { check } from "express-validator";

import { AuthMiddleware } from '../middleware/auth';
import { UserController } from '../controllers/user.controller';

const authM = new AuthMiddleware();

export class UserRouter extends BaseRouter<UserController> {
  
  constructor(){
    super(UserController);
  }

  routes(): void {
    this.router.get('/users', (req,res)=> this.controller.getAllUsers(req,res))
    this.router.post('/login', [
      check('email').not().isEmpty().exists().withMessage("The email field is required"),
      check('password').not().isEmpty().exists().withMessage("The password field is required")
    ], (req: Request,res: Response)=> this.controller.login(req, res))
    this.router.post('/register', [
      check('email').not().isEmpty().exists().withMessage("The email field is required"),
      check('password').not().isEmpty().exists().withMessage("The password field is required"),
      check('name').not().isEmpty().exists().withMessage("The name field is required"),
    ], (req: Request,res: Response)=> this.controller.register(req, res))
  }

}