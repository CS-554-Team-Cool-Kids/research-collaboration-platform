import signin from "./middleware/signedin.js";
import adminsOnly from "./middleware/admin.js";
import ratelimit from "./middleware/limits.js";
import sessionLocals from "./middleware/sessionlocals.js";

import login from "./users/login.js";
import resetpassword from "./users/resetpassword.js";
import register from "./users/registration.js";
import logout from "./users/logout.js";
import user_management from "./authentication/administration/users.js";
import configuration from "./authentication/administration/configuration.js";

function route(app) {
  app.use("/", sessionLocals);
  app.use("/login", ratelimit.login);
  app.use("/login", login);

  app.use("/register", ratelimit.registration);
  app.use("/register", register);

  app.use("/resetpassword", ratelimit.passwordresets); // Limit users to 1000 requests per 15 minutes
  app.use("/resetpassword", resetpassword);

  app.use("/", ratelimit.general); // Limit users to 1000 requests per 15 minutes
  app.use("/", signin); // Only allow signed in users to access routes below this one

  app.use("/logout", logout);

  app.use("/users", adminsOnly);
  app.use("/users", user_management);

  app.use("/configuration", adminsOnly);
  app.use("/configuration", configuration);

  app.use("/", (req, res) => {
    res.redirect("/login");
  });
}

export default route;
