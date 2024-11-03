import { verify as checkhash } from "argon2";
import { Collection, Document, ObjectId } from "mongodb";
import { users } from "../../../config/mongoCollections";
import verify from "../../../data_validation";

async function login(email: string, password: string) {
  email = verify.email(email);
  password = verify.password(password);

  // Retrieve users collection without additional type casting
  const usercol: Collection<Document> = await users();

  const user = await usercol.findOne(
    { email: email, status: "Active" },
    {
      projection: {
        password: 1,
        type: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        preferences: 1,
      },
    }
  );

  if (!user) {
    return { successful: false };
  }

  const passwordMatch = await checkhash(user.password as string, password);
  if (passwordMatch) {
    return {
      successful: true,
      id: user._id as ObjectId,
      type: user.type as string,
      email: user.email as string,
      name: `${user.firstname as string} ${user.lastname as string}`,
      preferences: user.preferences || {},
    };
  } else {
    return { successful: false };
  }
}

export default login;
