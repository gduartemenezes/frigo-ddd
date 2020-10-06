import http from "http";
import Koa from "koa";
import respond from "koa-respond";
import cors from "@koa/cors";
import bodyparser from "koa-bodyparser";
import { loadControllers, scopePerRequest } from "awilix-koa";

// app middlewares
import authenticate from "./auth/authenticate";
import accessControl from "./auth/accessControl";
import httpLogger from "./logger/httpLogger";
import errorHandler from "./errors/errorHandler";
import cache from "./cache/httpCache";
import notFoundHandler from "./errors/notFoundHandler";
import koaResponse from "./koa/koaMiddleware";

class Server {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
    this.app = new Koa();
    this.app.keys = [this.config.secret];
  }

  async create(container) {
    this.app
      .use(errorHandler)
      .use(respond)
      .use(cors({ credentials: true }))
      .use(bodyparser())
      .use(scopePerRequest(container))
      .use(httpLogger(this.logger))
      .use(authenticate)
      .use(cache)
      .use(accessControl.protect)
      .use(koaResponse)
      .use(loadControllers("./routes/*.js", { cwd: __dirname }))
      .use(notFoundHandler);

    this.app.on("SERVER_ERROR", (error) => {
      this.logger.error(error.stack);
    });

    const appServer = http.createServer(this.app.callback());

    return appServer;
  }

  async start(container) {
    const appServer = await this.create(container).catch((error) => {
      this.logger.error("Error while starting up the server", error);
      process.exit(1);
    });
    appServer &&
      appSerer.listen(this.config.server.port, () => {
        this.logger.info("App is running");
      });
  }
}
