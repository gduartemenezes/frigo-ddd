class MongooseRepository {
  constructor({ Model }) {
    this.collection = Model;
  }

  async count() {
    return this.collection.estimatedDocumentCount();
  }

  async find(query = {}, { multiple = true, count, lean } = {}) {
    const results = multiple
      ? this.collection.find(query)
      : this.collection.findOne(query);

    if (count) {
      return results.countDocuments.exec();
    } else if (lean) {
      return results.lean().exec();
    } else {
      return results.exec();
    }
  }

  async create(body) {
    const document = new this.collection(body);
    return document.save();
  }

  async update(document, body = {}) {
    const id = typeof document._id !== "undefined" ? document._id : document;
    return this.collection.findByIdAndUpdate(id, body, { new: true });
  }

  async remove(document) {
    const reloadedDocument = await this.reload(document);
    return reloadedDocument.remove();
  }

  async reload(document, { select, populate, lean } = {}) {
    if (!select && !populate && !lean && document instanceof this.collection) {
      return document;
    }
    return typeof document._id !== "undefined"
      ? this.findById(document._id, { select, populate, lean })
      : this.findById(document, { select, populate, lean });
  }

  onError(error, message) {
    // We will need to inject a logger in pur class constructor of course
    this.logger.error(error.stack);

    if (error.name === "MongoError" && error.code === 11000) {
      throw new Error("The resource already exists");
    }
    throw new Error(message || error.message);
  }
}
