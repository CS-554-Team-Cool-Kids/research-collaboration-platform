// You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import validator from "validator";
export const isInputProvided = (variable, variableName) => {
  if (variable === undefined || variable === null)
    throw new Error(`Error: ${variableName || "variable"} not provided`);
};

export const checkIsProperString = (str, strName) => {
  isInputProvided(str, strName);
  if (typeof str !== "string")
    throw new Error(`Error: ${strName || "provided variable"} is not a string`);

  str = str.trim();
  if (str.length === 0)
    throw new Error(
      `Error: ${strName || "provided variable"} is a empty string`
    );

  return str;
};

export const checkIsProperNumber = (val, variableName) => {
  if (typeof val !== "number") {
    throw new Error(
      `Error: ${variableName || "provided variable"} is not a number`
    );
  }

  if (isNaN(val)) {
    throw new Error(`Error: ${variableName || "provided variable"} is NaN`);
  }
};

export const checkIsProperArray = (arr, varName) => {
  if (!Array.isArray(arr))
    throw new Error(`Error: ${varName || "array"}  is not of type array`);

  if (arr.length === 0)
    throw new Error(`Error: ${varName || "array"} should not be empty`);
};

export const checkEachArrayElementString = (arrStrings, stringArrName) => {
  for (let str of arrStrings) {
    str = checkIsProperString(str, `strings of ${stringArrName}`);
  }
  return arrStrings;
};

export const checkIsProperFirstOrLastName = (name, nameVar) => {
  name = checkIsProperString(name, nameVar);
  if (/\d/.test(name)) throw new Error(`${nameVar} contains a number`); // number check regex from google
  if (name.length < 2)
    throw new Error(`${nameVar} should have atleast 2 charaters`);
  if (name.length > 25)
    throw new Error(`${nameVar} should not be more than 25 charaters`);
  return name;
};

export const checkIsProperPassword = (password) => {
  isInputProvided(password, "passowrd");
  password = checkIsProperString(password, "password");
  if (password.includes(" ") || password.length < 8)
    throw new Error(`password does not follow constraints`);
  if (password === password.toLowerCase())
    throw new Error(`password should have atleast one uppercase letter`);
  if (!/\d/.test(password))
    throw new Error(`password should have atleast one number`);
  // got regex from google
  if (!/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))
    throw new Error(`password should have atleast one special character`);

  return password;
};

export const validateEmail = (email) => {
  email = checkIsProperString(email, "email");
  if (!validator.isEmail(email))
    throw new Error("Error: Email address is invalid");

  return email;
};
