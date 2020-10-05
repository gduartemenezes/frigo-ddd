import { createContainer, asValue, asClass } from "awilix";

import Server from "./interfaces/http/server";
import Application from "./app/app";
import CreateUser from "./app/user/create";
import UpdateteUser from "./app/user/update";
import RemoveUser from "./app/user/remove";
import GetUser from "./app/user/get";
import SearchUser from "./app/user/search";
import ManageDB from "./infra/database";
import Repository from "./infra/database/repository";
import logger from "./infra/logger";

const container = createContainer();

container.register({
  server: asClass(Server).singleton(),
  // Application Layer
  app: asClass(Application).singleton(),
  createUser: asClass(CreateUser),
  updateUser: asClass(UpdateteUser),
  removeUser: asClass(RemoveUser),
  getUser: asClass(GetUser),
  searchUser: asClass(SearchUser),
  // Infrastructure layer
  db: asClass(ManageDB).singleton(),
  userRepository: asClass(Repository).singleton(),
  logger: asValue(logger),
});
