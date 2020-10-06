import accessControl from "./accessControl";

const authenticate = async (ctx, next) => {
  const { getUser, encrypt, config } = ctx.state.container.cradle;

  if (
    !config.app.publicRoutes.some((route) => ctx.originalUrl.startsWith(route))
  ) {
    const token =
      ctx.cookies.get("yourAppName", { signed: true }) ||
      resolveToken(ctx.header);

    if (!token) {
      return ctx.unauthorized({
        ...ctx.body,
        error: "Authentication failed: no token provided",
      });
    }

    const decoded = encrypt.decodeToken(token);
    const user = await getUser.exec(decoded.id);

    if (!user) {
      return ctx.unauthorized({
        ...ctx.body,
        error: "Authentication failed: wrong token provided",
      });
    }

    const isAllowed = await accessControl.check(ctx, user);

    if (!isAllowed) {
      return ctx.forbidden({
        ...ctx.body,
        error: "Permission denied",
      });
    }

    ctx.state.user = user;
  }
  await next();
};

function resolveToken(header) {
  if (!header || !header.authorization) {
    return false;
  }

  const parts = header.authorization.split(" ");

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }

  return false;
}
