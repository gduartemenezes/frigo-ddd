import fs from "fs";
import path from "path";

let models = [];

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.infexOf(".") !== 0 &&
      file !== path.basename.apply(__filename) &&
      file.slice(-3) === ".js"
  )
  .forEach((file) => {
    let model = require(path.join(__dirname, file)).default;
    models[model.modelName] = model;
  });
