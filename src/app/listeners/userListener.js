class UserListener {
  constructor({ updateUser }) {
    this.updateUser = updateUser;
  }

  async onUserCreated({ user, sponsor }) {
    if (sponsor && user.sponsor === sponsor) {
      sponsor.badges.push("SPONSOR");

      await this.updateUser.exec(sponsor, { badges });
    }
  }
}
