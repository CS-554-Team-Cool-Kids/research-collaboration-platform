import { randomUUID } from "crypto";
import { Collection } from "mongodb";
import { users } from "../../../config/mongoCollections"; // Ensure this file exports a promise that resolves to a Collection
import verify from "../../../data_validation"; // Assume this has proper TypeScript definitions
import sendRegistrationEmail from "../emails/sendRegistrationEmail"; // Assume this has proper TypeScript definitions

// Define the types for the parameters
interface PublicID {
  type: string;
  number?: string;
}

async function createUser(
  firstname: string,
  lastname: string,
  email: string,
  type: string
): Promise<{ successful: boolean }> {
  firstname = verify.name(firstname);
  lastname = verify.name(lastname);
  email = verify.email(email);

  // Remove identification context
  const publicID: PublicID = { type: "ssn" }; // Defaulting to "ssn" for demonstration; adjust as needed.

  type = verify.accountType(type);
  const usercol: Collection = await users();

  // Disallows multiple users with one email.
  const existinguser = await usercol.findOne(
    {
      email: email,
    },
    {
      projection: {
        _id: 0,
        email: 1,
      },
    }
  );

  if (existinguser) {
    const error: { status: number; message: string } = {
      status: 400,
      message: "A user with this email address already exists",
    };
    throw error;
  }

  let secret: string = randomUUID();

  let duplicatesecret = await usercol.findOne({ registrationcode: secret });

  while (duplicatesecret) {
    secret = randomUUID();
    duplicatesecret = await usercol.findOne({ registrationcode: secret });
  }

  const userdata = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    identification: publicID, // Removed the context here
    type: type,
    status: "Initialized", // Corrected spelling
    registrationcode: secret,
    registeredCourses: [],
  };

  const insertion = await usercol.insertOne(userdata);
  if (!insertion.acknowledged || !insertion.insertedId) {
    const error = { status: 500, message: "Database insertion error" };
    throw error;
  }

  try {
    await sendRegistrationEmail(email, secret);
    return { successful: true };
  } catch (e) {
    // Cleanup on failed email and rethrow the error
    await usercol.deleteOne({ _id: insertion.insertedId });
    throw e;
  }
}

export default createUser;
