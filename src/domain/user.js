import Entity from "./entity";

class User extends Entity {
  constructor(email, username, encodedPassword, { roles = ["USER"] } = {}) {
    super();
    this.email = email;
    this.username = username;
    this.encodedPassword = encodedPassword;
    this.roles = roles;
    this.lastLogin = null;
  }

  hasRole(role, roles = {}) {
    if (!role || this.roles.includes(role)) {
      return true;
    }

    let hasRole = false;
    Object.keys(roles).forEach((key) => {
      if (
        !hasRole &&
        roles[key] &&
        roles[key].inherits &&
        roles[key].inherits.includes(role)
      ) {
        hasRole = this.hasRole(key, roles);
      }
    });

    return hasRole;
  }
}

export default new User();
