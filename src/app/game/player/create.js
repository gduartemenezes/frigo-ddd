class CreatePlayer {
  constructor({ playerRepository }) {
    this.playerRepository = playerRepository;
  }

  async exec({ user, game }) {
    if (game.hasPlayer(user)) {
      throw new Error("The user is already playing the game");
    }

    const player = new Player(game, user);

    return this.playerRepository.create(player);
  }
}
