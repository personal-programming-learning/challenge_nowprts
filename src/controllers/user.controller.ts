import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Sequelize, Transaction } from "sequelize";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import moment from "moment";

import { Connection } from "../connection/index.connection";
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


  // Auth methods

  /**
   * Login
   * @param req 
   * @param res 
   * @returns 
   */
  public login = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    let { email, password } = req.body;

    try {
      const userData: any = await UsersModel().findOne({
        where: { email: email }
      });

      if(!userData){
        throw { message: '¡Credenciales inválidas!', error: 'Invalid credentials' };
      }

      let compare = bcrypt.compareSync(password, userData.password);

      if(!compare) {
        throw { message: '¡Credenciales inválidas!', error: 'Invalid credentials' };
      }

      const token = await this.generateToken(userData);

      res.header({ 'Authorization': token }).json({
        status: 'Ok',
        user: {
          email: userData.email,
          name: userData.name,
        }
      })

    } catch (error: any) {
      // if errors
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
        });
    }
  }

  /**
   * Register
   * @param req 
   * @param res 
   */
  public register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const { body } = req;
    const { email, password, name } = body;

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    var transaction: Transaction;
    try {
      const userData: any = await UsersModel().findOne({
        where: {
          email: email
        }
      });

      if (userData && userData.id) {
        throw { message: '¡El usuario ya existe!', error: true };
      }

      // init transaction
      transaction = await (Connection.getInstance().db as Sequelize).transaction();

      let salt = bcrypt.genSaltSync(10);
      let pass = bcrypt.hashSync(password, salt);

      // Create user
      body.createdAt = moment(Date.now()).format("YYYY-MM-DD");
      body.updatedAt = moment(Date.now()).format("YYYY-MM-DD");
      const _user: any = await UsersModel().create({
        ...body, password: pass,
      }, { transaction });

      // Generate Token
      let token = await this.generateToken(_user);

      // Commit transaction
      await transaction.commit();

      // Response
      res.header({ 'Authorization': token }).json({
        status: 'Ok',
        user: {
          email: _user.email,
          name: _user.name,
        }
      });

    } catch (error: any) {
      // Rollback a los cambios
      if (transaction!) await transaction!.rollback().catch(e => null);
      // if errors
      if (error.message)
        res.status(500).json(error);
      else
        res.status(500).json({
          message: 'Ha ocurrido un error en nuestro sistema, intenta nuevamente',
          error, code: 10
        });
    }
  }

  /**
   * Token Generate
   * @param user 
   * @param expireMinutes?
   * @param expire?
   * @returns 
   */
  public generateToken(user: any, expireMinutes?: number, expire: number = 30) {
    return new Promise((resolve, reject) => {
      try {
        const privateKey: any = process.env.SECRET_KEY_JWT_API;

        const token = jwt.sign({
          "id": user.id,
          "email": user.email,
          "name": user.name,
        }, privateKey, {
          algorithm: "HS256",
          expiresIn: !expireMinutes ? 3600 * 24 * expire : expireMinutes * 60,
        })

        resolve(token);
      } catch (error) {
        reject('Error generando el  token ' + error);
      }
    })
  }

}
