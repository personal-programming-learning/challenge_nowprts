import { DataTypes, Sequelize } from "sequelize";

import { Connection } from "../connection/index.connection";

const UsersModel = () => {
  let model = (Connection.getInstance().db as Sequelize).define('users',{
    "id": {
			"type": DataTypes.UUID,
			"primaryKey": true,
			"defaultValue": DataTypes.UUIDV4,
		},
		"message": {
			"type": DataTypes.STRING
		},
		"type": {
			"type": DataTypes.STRING
		},
		"user_id": {
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