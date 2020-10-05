import mongoose from "mongoose";

import { autoRemove } from "../../mongooseMiddleware";

import GameClass from "../../../../domain/game";

const GameSchema = mongoose.Schema(
  {
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    // other properties
  },
  { timestamps: true }
);
GameSchema.post("remove", autoRemove("Player", "game"));
GameSchema.loadClass(GameClass);

export default mongoose.model("Game", GameSchema);
