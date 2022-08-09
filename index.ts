import { ServerBootstrap } from "./src/server";

import * as dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/environments/.${process.env.ENV || 'local'}.env` });

const server = new ServerBootstrap();

server.listen(port => {
  console.log(`Server listen in http://${process.env.HOST}:${port}`)
});