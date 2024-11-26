import { GraphQLError } from "graphql";

import { ObjectId } from "mongodb";

import validator from "validator";

export const isInputProvided = (variable, variableName) => {
  if (variable === undefined || variable === null)
    throw new GraphQLError(`${variableName || "variable"} not provided`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
};

export const checkIsProperString = (str, strName) => {
  isInputProvided(str, strName);
  if (typeof str !== "string")
    throw new GraphQLError(
      `${strName || "provided variable"} is not a string`,
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );

  str = str.trim();
  if (str.length === 0)
    throw new GraphQLError(
      `${strName || "provided variable"} is an empty string`,
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );

  return str;
};

export const validateId = (id, idName) => {
  isInputProvided(id, idName);
  id = checkIsProperString(id, idName);
  if (!ObjectId.isValid(id)) {
    throw new GraphQLError(`${idName} is invalid object Id`, {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }

  return id;
};

export const checkLastName = (lastName, nameVar) => {
  isInputProvided(lastName, nameVar);
  lastName = checkIsProperString(lastName, nameVar);
  if (/\d/.test(lastName))
    throw new GraphQLError(`${nameVar} contains a number`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  if (lastName.length < 1)
    throw new GraphQLError(`${nameVar} should have at least 1 character`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  if (lastName.length > 25)
    throw new GraphQLError(`${nameVar} should not be more than 25 characters`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  return lastName;
};

export const checkIsProperFirstName = (name, nameVar) => {
  isInputProvided(name, nameVar);
  name = checkIsProperString(name, nameVar);
  if (/\d/.test(name))
    throw new GraphQLError(`${nameVar} contains a number`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  if (name.length < 2)
    throw new GraphQLError(`${nameVar} should have at least 2 characters`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  if (name.length > 25)
    throw new GraphQLError(`${nameVar} should not be more than 25 characters`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  return name;
};

export const validateEmail = (email) => {
  checkIsProperString(email, "email");

  if (!validator.isEmail(email))
    throw new GraphQLError("Error: Email address is invalid", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  email = checkIsProperString(email, "Email");
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.match(validRegex))
    throw new GraphQLError("Error: Invalid email format.", {
      extensions: { code: "BAD_USER_INPUT" },
    });

  return email;
};
