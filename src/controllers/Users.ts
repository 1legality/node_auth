// eslint-disable-next-line no-unused-vars
import { Request, Response } from "express";
import { getRepository } from "typeorm";
// eslint-disable-next-line no-unused-vars
import { IExpressWithJson } from 'express-with-json';
import { validate } from "class-validator";

import { User } from "../models/User";
import { checkJwt } from "../services/CheckJWT";
import { checkRole } from "../services/CheckRole";

export async function listAll(req: Request, res: Response) {
  //Get users from database
  const userRepository = getRepository(User);
  const users = await userRepository.find({
    select: ["id", "username", "role"] //We dont want to send the passwords on response
  });

  //Send the users object
  res.send(users);
}

export async function getOneById(req: Request, res: Response) {
  //Get the ID from the url
  const id = req.params.id;

  //Get the user from database
  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOneOrFail(id, {
      select: ["id", "username", "role"] //We dont want to send the password on response
    });
  } catch (error) {
    res.status(404).send("User not found");
  }
}

export async function newUser(req: Request, res: Response) {
  //Get parameters from the body
  const { username, password, role } = req.body;
  const user = new User();
  user.username = username;
  user.password = password;
  user.role = role;

  //Validate if the parameters are ok
  const errors = await validate(user);
  if (errors.length > 0) {
    res.status(400).send(errors);
    return;
  }

  //Hash the password, to securely store on DB
  user.hashPassword();

  //Try to save. If fails, the username is already in use
  const userRepository = getRepository(User);
  try {
    await userRepository.save(user);
  } catch (e) {
    res.status(409).send("username already in use");
    return;
  }

  //If all ok, send 201 response
  res.status(201).send("User created");
}

export async function loginWithPassword(email: string, password: string): Promise<User> {
  return new User();
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
  } catch (e) {
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
  } catch (error) {
    // user not found
    return null;
  }
}

export default (app: IExpressWithJson): void => {
    app.getJson('/users', checkJwt, checkRole(["ADMIN"]), listAll);
    app.postJson('/users', newUser);
    // app.patchJson('/users/:id', checkJwt, checkRole(["ADMIN"]), editUser);
    // app.deleteJson('/users/:id', checkJwt, checkRole(["ADMIN"]), deleteUser);
  }