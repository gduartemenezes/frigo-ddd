import mongoose from "mongoose";

const autoRemove = (model, parentCollection) => {
  async (document) => {
    const Model = mongoose.model(model);
    const parentId = document._id;
    const query = removeChildren(parentCollection, parentId);
    const removeChildren = await Model.find(query);

    for (const child of children) {
      await child.remove();
    }
  };
};
