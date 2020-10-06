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

accessControl.check = async (ctx, user) => {
  const { getAcl, config } = ctx.state.container.cradle;
  const aclRules = config.app.aclRules;
  const { resourceType, resourceReference, operation } = resolveOperation(
    ctx.originalUrl,
    ctx.method
  );

  let acl =
    (await getParentAcl.exec(ctx, user, resourceType, resourceReference)) ||
    (await getAcl.exec(
      aclRules,
      resourceType,
      resourceReference,
      user.toString()
    ));

  // If nothing is found yet, attempt to get the correct resource parameters
  if (!acl.resourceReference && operation === "read") {
    acl = await getAcl.exec(resourceType, resourceReference);
    acl.params.isOwner = false;
  }

  // If a parent acl has been found, make sure the child resource type is used
  acl.resourceType = resourceType;
  acl.params = {
    ...(!resourceReference ? aclRules.defaultParams : {}),
    ...acl.params,
    ...processQueryParametersForACl(ctx.query, aclRules),
  };

  return user.roles.some((role) => acl.can(role, operation));
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

function processQueryParametersForACl(query, aclRules) {
  const allowedParams = [...Object.keys(defaultParams), "isOwner"];
  let opts = {};
  Object.keys(query).forEach((key) => {
    if (query[key] && allowedParams.includes(key)) {
      opts[key] = query[key] === "true";
    }
  });

  return opts;
}

async function getParentAcl(ctx, user, resourceType, resourceReference) {
  const { getAcl, config } = ctx.state.container.cradle;
  const aclRules = config.app.aclRules;
  let reloadedParentResource;
  let parentAcl;

  if (
    aclRules.dependencies[resourceType] &&
    aclRules.dependencies[resourceType].on
  ) {
    const parentResourceType = aclRules.dependencies[resourceType].on;
    const parentResource = clx.request.body[parentResourceType];

    if (parentResource) {
      // if the parent resource is sent with the request, use it
      const repository =
        ctx.state.container.cradle[parentResourceType + "Repository"];

      reloadedParentResource = await reload(repository, parentResource);
    } else {
      // If not, load the parent resource of the entity, provided there is a valid id as resource reference
      const repository =
        ctx.state.container.cradle[resourceType + "Repository"];
      const reloadedResource = await reload(repository, resourceReference);

      reloadedParentResource = reloadedResource
        ? reloadedResource[parentResourceType]
        : null;
    }

    if (reloadedParentResource) {
      parentAcl = await getAcl.exec(
        aclRules,
        parentResourceType,
        reloadedParentResource.toString(),
        user.toString()
      );
    }
  }
  return parentAcl;
}

async function reload(repository, resource) {
  if (!repository || !resource) {
    return false;
  }

  try {
    return await repository.reload(resource);
  } catch (error) {
    return false;
  }
}
