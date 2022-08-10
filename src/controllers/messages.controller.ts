import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Sequelize, Transaction } from "sequelize";
import moment from "moment";

import { Connection } from "../connection/index.connection";
import UsersModel from "../models/users.models";
import { SendMail } from "../helpers/sendMail";

export class MessagesController {
  
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

  /**
   * Get user by id
   * @param req 
   * @param res 
   */
  async getUser(req: Request, res: Response) {
    try {

      const { id } = req.params;

      const response = await UsersModel().findByPk(id);

      if(!response) {
        res.status(404)
        .json({
          message: `No se encuentra el recurso solicitado con el id ${id}`,
          error: 'Not found',
        })
      }

      res.json(response);

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Create User
   * @param req 
   * @param res 
   */
  async createUser(req: Request, res: Response){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    const { body }= req;
    
    try {
      
      const request = await UsersModel().create(body);
      res.status(201).json(request)

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Update User
   * @param req 
   * @param res 
   * @returns 
   */
  async updateUser(req: Request, res: Response){
    
    const { id } = req.params;
    const { body } = req;
    
    try {
      
      const response = await UsersModel().findByPk(id);
      if (!response) {
        return res.status(404).json({
          message: `No se encuentra el recurso solicitado con el id ${id}`,
          error: 'Not found',
        });
      }

      await response.update(body, {
        where: { id }
      })

      res.status(201).json(response)

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Delete User
   * @param req 
   * @param res 
   * @returns 
   */
  async deleteUser(req: Request, res: Response){
    
    const { id } = req.params;

    try {
      const request = await UsersModel().findByPk(id);
      if (!request) {
        return res.status(404).json({
          message: `No se encuentra el recurso solicitado con el id ${id}`,
          error: 'Not found',
          code: 40
        });
      }

      // Eliminación fisica
      await request.destroy();

      res.json({
        message: `El registro con el ID ${id} ha sido eliminado`
      })
      
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * send messages by email 
   * @param req 
   * @param res 
   */
  async sentMessage(req: Request, res: Response){
    try {
      
      const { body } = req;

      this.sentEmail(body.template, body.data, body.subject);

    } catch (error) {
      console.error('Error: ', error);
    }
  }

  public sentEmail(template: string, data: any, subject: string){
    new SendMail(template)
    .send(data, subject)
    .catch(e => { 
      throw { message: `Email from ${subject} not sending. Error: ${e}` } 
    })
  }


}
