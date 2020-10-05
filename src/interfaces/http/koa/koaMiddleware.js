ctx.body = {
  self: ctx.originalUrl,
  meta: {
    name: "Your api name",
    version: "x.x.x",
    copyright: "(c) xxxx GDM Eng de Software <gdm@gmail.com>",
  },
};
