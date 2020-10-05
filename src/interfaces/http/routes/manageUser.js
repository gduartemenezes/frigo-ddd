import { createController } from "awilix-koa";

import manageUserAPI from "../api/manageUser";

const manageUserRoutes = createController(manageUserAPI)
  .prefix("/users")
  .post("/create", "createUser")
  .patch("/:id/update", "updateUser");
// other methods
