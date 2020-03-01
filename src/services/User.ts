import { User } from "../models/User";
import { validate } from "class-validator";
import { getRepository } from "typeorm";

export async function loginWithPassword(email: string, password: string): Promise<User> {
  if (!(email || password))
  Promise.reject("email or password missing");

  const user: User = await findOneByEmail(email);
  if (user === null) {
    // email address doesn't exist
    Promise.reject("email or password is incorrect");
  }

  //Check if encrypted password match
  if (!user.checkIfUnencryptedPasswordIsValid(password)) {
    // bad password but don't give any hint about the email
    Promise.reject("email or password is incorrect")
  }

  return user;
}

export async function addOrLoginUser(user: User): Promise<User> {
  //Validate if the parameters are ok
  const errors = await validate(user);

  if (errors.length > 0) {
    return Promise.reject("Could not create user");
  }

  const userAlreadyExist: User = await findOneByEmail(user.email);
  if (userAlreadyExist !== null) {
    return userAlreadyExist;
  }

  //Try to save the new user...
  const userRepository = getRepository(User);
  try {
    await userRepository.save(user);
  } 
  catch (e) {
    return Promise.reject(e);
  }
}

async function findOneByEmail(email: string): Promise<User> {
const userRepository = getRepository(User);
try {
    const user: User = await userRepository.findOneOrFail({
    where: {
      email: email
    }
    })
    return user;
  } 
  catch (error) {
    // user not found
    return null;
  }
}
