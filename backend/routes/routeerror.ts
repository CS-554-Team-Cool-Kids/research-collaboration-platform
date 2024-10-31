import { Response } from "express";

const routeError = (res: Response, e: Error) => {
  console.error("Error:", e.message); // Log the error message

  // Set a default status code
  let statusCode = 500;
  let message = "Internal server error";

  // Customize response based on specific errors if necessary
  if (e.message.includes("authentication")) {
    statusCode = 401;
    message = e.message;
  } else if (e.message.includes("do not match")) {
    statusCode = 400;
    message = e.message;
  } else if (e.message.includes("fetching user information")) {
    statusCode = 500;
  }

  res.status(statusCode).render("public/error", { error: message });
};

export default routeError;
