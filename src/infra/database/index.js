import mongoose from "mongoose";

class ManageDB {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
  }
  async connect() {
    let credentials = "";

    if (this.config.auth) {
      credentials = `${this.config.user}:${this.config.password}@`;
    }

    const connection =
      typeof this.config === "string"
        ? this.config
        : `mongodb://${credentials}${this.config.host}:${this.config.port}/${this.config.database}`;

    const options = this.config.ENV === "prod" ? { autoIndex: false } : {};

    this.logger.debug("Connecting to database...");

    mongoose.set("useCreateIndex", true);
    mongoose.set("unseFindAndModify", false);

    await mongoose
      .connect(connection, { useNewUrlParser: true, ...options })
      .catch((error) => {
        this.logger.error("Error while connection to the database", error);
        process.exit(1);
      });
    this.logger.debug("Connected to the database");
  }

  async close() {
    this.logger.debug("Closing database...");

    await mongoose.connection.close().catch((error) => {
      this.logger.error("Error while closing the database", error);
      process.exit(1);
    });
    this.logger.debug("Database closed");
  }
}
