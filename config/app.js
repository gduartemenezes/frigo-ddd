module.exports = {
  publicRoutes: [
    "/user/create",
    "/user/token/create",
    "/user/exist/email",
    "/user/exist/username",
    "/user/password/reset",
    "/user/logout",
  ],
  defaultParams: {
    isPublished: true,
    isPrivate: false,
  },
  aclRules: {
    roles: {
      USER: {
        can: {
          read: [
            { resource: "user" },
            {
              resource: "place",
              when: {
                isPublished: true,
                isPrivate: false,
              },
              except: { isOwner: true },
            },
          ],
          update: [
            { resource: "user", when: { isOwner: true } },
            { resource: "place", when: { isOwner: true } },
          ],
          remove: [
            { resource: "user", when: { isOwner: true } },
            { resource: "place", when: { isOwner: true } },
          ],
        },
      },
      ADMIN: {
        inherits: ["USER"],
        can: {
          read: [
            {
              resource: "place",
            },
          ],
          update: [{ resource: "user" }, { resource: "place" }],
        },
      },
      SUPER_ADMIN: {
        inherits: ["ADMIN"],
        can: {
          remove: [{ resource: "user" }, { resource: "place" }],
        },
      },
    },
  },
};
