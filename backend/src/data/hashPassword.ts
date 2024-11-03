import argon2 from "argon2";
import verify from "../data_validation";

// Define the function to hash passwords with the correct type
async function hashPassword(password: string): Promise<string> {
  // Validate the password
  password = verify.password(password);

  // OWASP recommends using only one degree of parallelism.
  // The other recommendations are at a higher standard than recommended by default.
  password = await argon2.hash(password, {
    type: argon2.argon2id,
    parallelism: 1,
  });

  return password;
}

export default hashPassword;
