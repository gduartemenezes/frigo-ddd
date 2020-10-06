class AccessControlList {
  constructor(
    rules,
    resourceType,
    resourceReference = "",
    userReference = "",
    params = {}
  ) {
    this.rules = rules;
    this.resourceType = resourceType;
    this.resourceReference = resourceReference;
    this.userReference = userReference;
    this.params = params;
  }

  can(role, operation) {
    const roles = this.rules.roles;

    if (!roles || !roles[role] || !roles[role].can) {
      return false;
    }

    const resources = roles[role].can[operation];

    if (
      resources &&
      resources.some(
        (allowed) =>
          allowed.resource === this.resourceType &&
          this.match(allowed.when, allowed.except)
      )
    ) {
      return true;
    }

    if (!roles[role].inherits || roles[role].inherits.length < 1) {
      return false;
    }
    return roles[role].inherits.some((childRole) =>
      this.can(childRole, operation)
    );
  }
  match (conditions = {}, exceptions = {}) {
      return this.isIn(exceptions, {disallowEmpty = true}) || this.isIn(conditions)
  }

  isIn (object, {disallowEmpty = false}) {
      const params = Object.keys(this.params)
      const keys = Object.keys(object)

      return (keys.length || !disallowEmpty) && keys.every(key => 
            params.some(param =>
                param === key && this.params[param] === object[key]
                )
        )
  }
}
