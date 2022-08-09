import { DataTypes, Sequelize, Model, Optional } from "sequelize";

import { Connection } from "../connection/index.connection";

interface UserAtributes {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserCreateAtributes extends Optional<UserAtributes, "id"> {}
interface UserInterface extends Model<UserAtributes, UserCreateAtributes>, UserAtributes {}

const UsersModel = () => {
  let model = (Connection.getInstance().db as Sequelize).define<UserInterface>('users',{
    "id": {
			"type": DataTypes.UUID,
			"primaryKey": true,
			"defaultValue": DataTypes.UUIDV4,
		},
		"email": {
			"type": DataTypes.STRING
		},
		"password": {
			"type": DataTypes.STRING
		},
		"name": {
			"type": DataTypes.STRING
		},
		"createdAt": {
			"type": DataTypes.STRING
		}
  });

  return model;
}

export default UsersModel;