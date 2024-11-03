import { Application } from "express";
import signin from "./middleware/signedin";
import adminsOnly from "./middleware/admin";
import ratelimit from "./middleware/limits";
import sessionLocals from "./middleware/sessionlocals";

import login from "./authentication/users/login";
import resetpassword from "./authentication/users/resetpassword";
import register from "./authentication/users/registration";
import logout from "./authentication/users/logout.js";
import user_management from "./authentication/administration/users";

const route = (app: Application): void => {
  //Middleware checks - Uncomment for later production use
  app.use("/", sessionLocals);
  //app.use("/", ratelimit.general);
  //app.use("/", signin);
  //app.use("/login", ratelimit.login);
  //app.use("/register", ratelimit.registration);
  //app.use("/resetpassword", ratelimit.passwordresets);
  //app.use("/users", adminsOnly);

  app.use("/login", login);
  app.use("/register", register);
  app.use("/resetpassword", resetpassword);
  app.use("/logout", logout);
  app.use("/users", user_management);

  app.use("/", (req, res) => {
    res.redirect("/login");
  });
};

export default route;
