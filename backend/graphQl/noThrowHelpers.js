// Import required modules
import { ObjectId } from "mongodb";

// Classic checkArg
function checkArg(argument, type, argumentName) {
  if (argument === undefined) {
    console.error(`Validation failed: The argument (${argumentName}) is undefined.`);
    return false;
  } else if (argument === null) {
    console.error(`Validation failed: The argument (${argumentName}) is null.`);
    return false;
  } else if (type === "array" && !Array.isArray(argument)) {
    console.error(`Validation failed: (${argumentName}) is not a valid array.`);
    return false;
  } else if (type !== "array" && typeof argument !== type) {
    console.error(`Validation failed: The argument (${argumentName}) is not a ${type}.`);
    return false;
  }

  if (type === "string" && argument.trim().length === 0) {
    console.error(
      `Validation failed: The argument (${argumentName}) is empty or only whitespace.`
    );
    return false;
  }

  if (type === "number" && isNaN(argument)) {
    console.error(`Validation failed: The argument (${argumentName}) must be a number.`);
    return false;
  }

  if (
    type === "number" &&
    (argumentName === "establishedYear" || argumentName === "createdYear")
  ) {
    const currentYear = new Date().getFullYear();
    if (argument < 2000 || argument > currentYear + 5) {
      console.error(
        `Validation failed: The established/created year must be between 2000 and ${currentYear}.`
      );
      return false;
    }
  }

  if (argumentName === "id" && !ObjectId.isValid(argument)) {
    console.error(`Validation failed: The argument (${argumentName}) is not a valid ObjectId.`);
    return false;
  }

  if (argumentName === "name" || argumentName === "title") {
    const nameRegex = /^[a-zA-Z\s\-]+$/;

    if (!nameRegex.test(argument)) {
      console.error(
        `Validation failed: The argument (${argument}) contains invalid characters. Names should only include letters, spaces, and hyphens.`
      );
      return false;
    }
  }

  if (argumentName === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(argument)) {
      console.error(`Validation failed: The argument (${argument}) is not a valid email address.`);
      return false;
    }
  }

  if (argumentName === "password") {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(argument)) {
      console.error(
        `Validation failed: The argument (${argument}) does not meet the password complexity requirements. It must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.`
      );
      return false;
    }
  }

  if (argumentName === "bio") {
    if (argument.length > 250) {
      console.error(`Validation failed: The provided bio must be 250 characters or less.`);
      return false;
    }
  }

  if (argumentName === "content") {
    if (argument.length > 250) {
      console.error(`Validation failed: The provided comment must be 250 characters or less.`);
      return false;
    }
  }

  // ENUM CHECKS

  if (argumentName === "department") {
    return checkDepartment(argument);
  }

  if (argumentName === "date") {
    return checkDate(argument);
  }

  if (argumentName === "subject") {
    return checkSubject(argument);
  }

  if (argumentName === "role") {
    return checkRole(argument);
  }

  if (argumentName === "commentDestination") {
    return checkCommentDestination(argument);
  }

  if (argumentName === "applicationStatus") {
    return checkApplicationStatus(argument);
  }

  // ARRAY CHECKS

  // Check for 'chapters' type
  if (type === "chapters") {
    for (const chapter of argument) {
      if (
        typeof chapter.title !== "string" ||
        chapter.title.trim().length === 0
      ) {
        console.error(
          `Validation failed: Each chapter in (${argumentName}) must have a valid title.`
        );
        return false;
      }
    }
  }

  return true;
}

// Check Date: ensures MM/DD/YYYY
function checkDate(date) {
  if (typeof date !== "string") {
    console.error(`Validation failed: The date must be a string in MM/DD/YYYY format.`);
    return false;
  }

  if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(date)) {
    console.error(`Validation failed: The date must be in MM/DD/YYYY format.`);
    return false;
  }

  return true;
}

// Function to validate department against predefined departments
function checkDepartment(department) {
  const validDepartments = [
    "BIOMEDICAL_ENGINEERING",
    "CHEMICAL_ENGINEERING_AND_MATERIALS_SCIENCE",
    "CHEMISTRY_AND_CHEMICAL_BIOLOGY",
    "CIVIL_ENVIRONMENTAL_AND_OCEAN_ENGINEERING",
    "COMPUTER_SCIENCE",
    "ELECTRICAL_AND_COMPUTER_ENGINEERING",
    "MATHEMATICAL_SCIENCES",
    "MECHANICAL_ENGINEERING",
    "PHYSICS",
    "SYSTEMS_AND_ENTERPRISES",
  ];

  if (!validDepartments.includes(department.trim().toUpperCase())) {
    console.error(
      `Validation failed: Invalid department: ${department}. Must be one of ${validDepartments.join(
        ", "
      )}.`
    );
    return false;
  }

  return true;
}

// Function to validate subject against predefined departments
function checkSubject(subject) {
  const validSubjects = [
    "CALL_FOR_APPLICANTS",
    "TEAM_UPDATE",
    "PROJECT_LAUNCH",
    "MILESTONE_REACHED",
    "PROGRESS_REPORT",
    "DEADLINE_UPDATE",
    "REQUEST_FOR_FEEDBACK",
    "FUNDING_UPDATE",
    "EVENT_ANNOUNCEMENT",
    "ISSUE_REPORTED",
    "PUBLISHED_ANNOUNCEMENT",
    "FINAL_RESULTS",
    "PROJECT_COMPLETION",
  ];

  if (!validSubjects.includes(subject.trim().toUpperCase())) {
    console.error(
      `Validation failed: Invalid subject: ${subject}. Must be one of ${validSubjects.join(", ")}.`
    );
    return false;
  }

  return true;
}

// Function to validate comment destination
function checkCommentDestination(commentDestination) {
  const validDestination = ["UPDATE", "APPLICATION"];

  if (!validDestination.includes(commentDestination.trim().toUpperCase())) {
    console.error(
      `Validation failed: Invalid comment destination: ${commentDestination}. Must be one of ${validDestination.join(
        ", "
      )}.`
    );
    return false;
  }

  return true;
}

// Function to validate role against the predefined enum
function checkRole(role) {
  const validRoles = ["STUDENT", "PROFESSOR", "ADMIN"];

  if (!validRoles.includes(role.trim().toUpperCase())) {
    console.error(
      `Validation failed: Invalid role: ${role}. Must be one of ${validRoles.join(", ")}.`
    );
    return false;
  }

  return true;
}

// Function to validate application status against the predefined enum
function checkApplicationStatus(applicationStatus) {
  const validStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "WITHDRAWN",
    "WAITLISTED",
  ];

  if (!validStatuses.includes(applicationStatus.trim().toUpperCase())) {
    console.error(
      `Validation failed: Invalid application status: ${applicationStatus}. Must be one of ${validStatuses.join(
        ", "
      )}.`
    );
    return false;
  }

  return true;
}

// Function to check year range validity
function checkYearRange(min, max) {
  const currentYear = new Date().getFullYear();

  if (min <= 0 || max < min || max > currentYear) {
    console.error(
      `Validation failed: Year range is invalid. "min" year must be greater than 0, "max" year must be greater than or equal to "min" year, and "max" year cannot be more than ${currentYear}.`
    );
    return false;
  }

  return true;
}

// Export all helper functions
export {
  checkArg,
  checkDate,
  checkDepartment,
  checkSubject,
  checkYearRange,
  checkRole,
  checkCommentDestination,
};
