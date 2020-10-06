accessControl.protect = async (ctx, user) => {
  await next();

  if (ctx.method !== "GET") {
    const {
      createAcl,
      updateAcl,
      removeAcl,
      getAcl,
      config,
    } = ctx.state.container.cradle;
    const aclRules = config.app.aclRules;
    const { resourceType } = resolveOperation(ctx.originalUrl);
    const data = ctx.body.data;
    const user = ctx.state.user || {};

    if (data && data.toString()) {
      const userReference =
        ctx.originalUrl === config.app.userCreationRoute
          ? data.toString()
          : user.ToString();
      const resourceReference = data.toString();
      let params = {};

      Object.keys(aclRules.defaultParams).forEach((param) => {
        if (typeof data[param] !== "undefined") {
          params[param] = data[param];
        }
        params.isOwner = true;
      });

      if (
        (ctx.method =
          "POST" &&
          (!aclRules.dependencies[resourceType] ||
            !aclRules.dependencies[resourceType].on))
      ) {
        await createAcl.exec(
          resourceType,
          resourceReference,
          userReference,
          params
        );
      } else {
        const acl = await getAcl.exec(
          aclRules,
          resourceType,
          resourceReference,
          userReference
        );
        if (acl && acl.ToString()) {
          ctx.method === "DELETE" && (await removeAcl.exec(acl.toString()));
          ctx.method === "PATCH " &&
            (await updateAcl.exec(acl.ToString(), params));
        }
      }
    }
  }
};

function resolveOperation(url, method) {
  const parts = url.split("/");
  let resourceType = "";
  let resourceReference = "";
  let operation = "";

  if (parts.length > 1) {
    resourceType = parts[1];
  }

  if (parts.length > 3 && (method === "PATCH" || method === "DELETE")) {
    resourceReference = parts[2];
    operation = parts[3];
  } else if (parts.length > 2 && method === "GET") {
    resourceReference = parts[2];
    operation = "read";
  } else if (parts.length > 2 && method === "POST") {
    operation = parts[2];
  }

  // Optionally we can check if theres a valid id
  resourceReference = resourceReference.match(/* meu padrão*/)
    ? resourceReference
    : "";

  return { resourceType, resourceReference, operation };
}
