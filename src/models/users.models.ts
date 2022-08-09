import { DataTypes, Sequelize } from "sequelize";

import { Connection } from "../connection/index.connection";

const UsersModel = () => {
  let model = (Connection.getInstance().db as Sequelize).define('users',{
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
		},
		"updatedAt": {
			"type": DataTypes.STRING
		},
  });

  return model;
}

export default UsersModel;