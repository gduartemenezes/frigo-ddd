class Application {
  constructor({ db, server }) {
    this.database = db;
    this.server = server;
  }

  async start(container) {
    await this.database.connect();
    await this.server.start(container);
  }
}
