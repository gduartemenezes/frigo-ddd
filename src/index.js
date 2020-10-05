import container from "./container";

const app = container.cradle.app;

app.start(container).catch((error) => {
  app.server.logger.error(error.stack);
  process.exit();
});
