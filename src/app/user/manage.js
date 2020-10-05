class ManageUser {
  constructor({ createUser, updateUser, userListener }) {
    this.createUser = createUser.exec.bind(createUser);
    this.updateUser = updateUser.exec.bind(updateUser);

    const listener = userListener.onUserCreated.bind(userListener);

    createUser.on(createUser.events.USER_CREATED, listener);
  }
}
