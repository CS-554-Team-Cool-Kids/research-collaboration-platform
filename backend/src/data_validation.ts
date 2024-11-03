import { ObjectId } from "mongodb";
import moment from "moment";
import xss from "xss";

interface GovernmentID {
  type: string;
  number: string;
}

export function throwError(message: string): never {
  const error: { status: number; message: string } = { status: 400, message };
  throw error;
}

export function throwErrorWithStatus(status: number, message: string): never {
  const error: { status: number; message: string } = { status, message };
  throw error;
}

export function sanitizeInputs(req: { body: Record<string, any> }): {
  body: Record<string, any>;
} {
  // Sanitizes all inputs in a request object
  for (let key in req.body) {
    req.body[key] = xss(req.body[key]);
  }
  return req;
}

const verify = {
  email: (email: string): string => {
    function surroundingCheck(str: string, part: string): void {
      const sections = str.split(part);
      for (const section of sections) {
        if (section.length === 0) {
          throwError("Invalid email");
        }
      }
    }

    if (typeof email !== "string") {
      throwError("Email is not a string");
    }

    email = email.trim().toLowerCase();

    if (!/^([a-z]|\d|\.|\_|\-)+@([a-z]|\d|\-)+\.([a-z]|\d|\-)+$/.test(email)) {
      throwError("Invalid email");
    }

    const left = email.split("@")[0];

    // Use surroundingCheck function to validate parts of the local part of the email
    surroundingCheck(left, ".");
    surroundingCheck(left, "_");
    surroundingCheck(left, "-");

    return email;
  },

  password: (password: string): string => {
    // Password rules favoring length over complexity based on NIST recommendations
    if (typeof password !== "string") {
      throwError("Password is not a string");
    }
    password = password.trim();
    if (password.length < 8 || password.length > 128) {
      throwError("Password must be between 8 and 128 characters long");
    }
    return password;
  },
  name: (name: string): string => {
    if (typeof name !== "string") {
      throwError("Name is not a string");
    }
    name = name.trim().toLowerCase();
    if (name.length < 3 || name.length > 20) {
      throwError("Name must be between 3 and 20 characters long");
    }
    for (const char of name) {
      if (!/([a-z]|-|\ |\')/.test(char)) {
        throwError("Invalid character in name");
      }
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  },
  ssn: (ssn: string): string => {
    if (typeof ssn !== "string") {
      throwError("Social Security Number is not a string");
    }
    ssn = ssn.trim();
    if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
      throwError("Invalid Social Security Number");
    }
    return ssn;
  },
  accountType: (type: string): string => {
    if (typeof type !== "string") {
      throwError("Invalid account type");
    }
    type = type.trim();

    const types = ["Admin", "Professor", "Student"];
    if (!types.includes(type)) {
      throwError("Invalid account type");
    }
    return type;
  },
  sectionType: (type: string): string => {
    if (typeof type !== "string") {
      throwError("Invalid section type");
    }
    type = type.trim();

    const types = ["In Person", "Online"];
    if (!types.includes(type)) {
      throwError("Invalid section type");
    }
    return type;
  },
  time: (time: string, timeName: string): string => {
    const timeSplit = time.split(":");

    if (timeSplit.length !== 2) {
      throwError(`Invalid ${timeName}`);
    }

    const hr = timeSplit[0];
    const min = timeSplit[1];

    const hourNum = parseInt(hr);
    if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
      throwError(`Invalid hour in ${timeName}`);
    }
    if (isNaN(parseInt(min)) || parseInt(min) < 0 || parseInt(min) > 59) {
      throwError(`Invalid minutes in ${timeName}`);
    }

    return time;
  },
  day: (day: string, dayName: string): string => {
    day = verify.string(day, dayName);
    const weekHelper = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (!weekHelper.includes(day)) {
      throwError("Invalid week value");
    }
    return day;
  },
  semester: (semester: string, semesterName: string): string => {
    semester = verify.string(semester, semesterName);
    const semesterHelper = ["Fall", "Spring", "Summer", "Winter"];
    if (!semesterHelper.includes(semester)) {
      throwError("Invalid semester value");
    }
    return semester;
  },
  year: (year: string): string => {
    const checkYear = moment(year);
    if (!checkYear.isValid()) {
      throwError(`Year is not valid`);
    }
    return year;
  },
  dbid: (id: ObjectId): ObjectId => {
    if (!(id instanceof ObjectId)) {
      throwError("Not an ObjectId");
    }
    return id;
  },
  validateMongoId: (id: string, stringName: string): ObjectId => {
    if (!ObjectId.isValid(id)) {
      throwError(`${stringName} is not an ObjectId`);
    }
    return new ObjectId(id);
  },
  UUID: (id: string): string => {
    if (typeof id !== "string") {
      throwError("Argument is not a string");
    }
    id = id.trim();
    if (!/^[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}$/.test(id)) {
      throwError("Invalid UUID");
    }
    return id;
  },
  string: (string: string, stringName: string): string => {
    if (typeof string !== "string") throwError(`${stringName} is not a string`);
    if (!string.trim()) throwError(`${stringName} is not a string`);
    return string.trim();
  },
  number: (number: number, numberName: string): number => {
    if (typeof number !== "number" || isNaN(number) || number < 0)
      throwError(`${numberName} is not a valid number`);
    return number;
  },
  rationalNumber: (number: number, numberName: string): number => {
    if (typeof number !== "number" || isNaN(number) || number < 0)
      throwError(`${numberName} is not a valid number`);
    return number;
  },
  numberInteger: (number: string, numberName: string): number => {
    const num = parseInt(number);
    if (isNaN(num)) throwError(`${numberName} is not a valid integer`);
    if (num < 0) throwError(`${numberName} is not a valid integer`);
    return num;
  },
};

export default verify;
