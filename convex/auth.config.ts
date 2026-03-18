const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN ?? "";

const authConfig = {
  providers: issuer
    ? [
        {
          domain: issuer,
          applicationID: "convex",
        },
      ]
    : [],
};

export default authConfig;
