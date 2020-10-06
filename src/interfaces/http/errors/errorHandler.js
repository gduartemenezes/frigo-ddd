const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = error.statusCode || 500;
    ctx.body = {
      ...ctx.body,
      error: proccess.env.NODE_ENV !== "prod" ? error.stack : error.message,
    };
    ctx.app.emmit("SERVER_ERROR", error);
  }
};
