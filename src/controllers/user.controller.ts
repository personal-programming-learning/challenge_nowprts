import { Request, Response } from "express";

import UsersModel from "../models/users.models";

export class UserController {
  
  /**
   * Get all Users
   * @param req 
   * @param res 
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      
      let page: number = req.query.page ? parseInt(req.query.page as string) : 1;
      let limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;
      let offset = (page - 1) * limit;

      const results = await UsersModel().findAndCountAll({
        limit,
        offset
      });

      let rpt = {
        data: results.rows,
        meta: {
          total: results.count,
          page
        }
      }

      res.header({
        'x-total-count': results.count, 'access-control-expose-headers':'X-Total-Count' 
      }).json(rpt);

    } catch (error) {
      console.error(error);
    }
  }

}