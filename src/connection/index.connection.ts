import { Sequelize } from "sequelize";

export class Connection {

  private static instance: Connection;
  public db?: Sequelize;

  constructor(){};

  public static getInstance(): Connection {

    if(!Connection.instance) {
      Connection.instance = new Connection();

      Connection.instance.db = new Sequelize({
        dialect: 'sqlite',
        storage: './chalenge_nowports.sqlite',
      })
    }

    return Connection.instance;
  }

}