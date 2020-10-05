import api from "./mainController";

const manageUserApi = ({ manageUser }) => ({
  createUser: api(manageUser, "createUser"),
  updateUser: api(manageUser, "updateUser", ["id "]),
  // outros metodos do manager
});
