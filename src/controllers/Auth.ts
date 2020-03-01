import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { IExpressWithJson } from 'express-with-json';
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";
import passport from "passport"

import { User } from "../models/User";
import { checkJwt } from "../services/CheckJWT";

require('dotenv/config'); // load everything from `.env` file into the `process.env` variable
const { JWTSECRET } = process.env;

interface IUserRequest extends Request {
  user: User
}

export async function login(req: IUserRequest, res: Response) {
  const { user } = req;

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWTSECRET,
    { expiresIn: "30d" }
  )

  res.send(token);
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  //Get ID from JWT
  const id = res.locals.jwtPayload.userId;

  //Get parameters from the body
  const { oldPassword, newPassword } = req.body;
  if (!(oldPassword && newPassword)) {
    res.status(400).send();
  }

  //Get user from the database
  const userRepository = getRepository(User);
  let user: User;
  try {
    user = await userRepository.findOneOrFail(id);
  } catch (id) {
    res.status(401).send();
  }

  //Check if old password matchs
  if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
    res.status(401).send();
    return;
  }

  //Validate de model (password lenght)
  user.password = newPassword;
  const errors = await validate(user);
  if (errors.length > 0) {
    res.status(400).send(errors);
    return;
  }
  //Hash the new password and save
  user.hashPassword();
  userRepository.save(user);

  res.status(204).send();
}

export default (app: IExpressWithJson): void => {
  app.getJson('/login', login);
  app.postJson('/login', passport.authenticate('local'), login);
  app.postJson('/login/facebook', passport.authenticate('facebook-token'), login);
  app.postJson('/login/google', passport.authenticate('google-oauth-token'), login);
  app.postJson('/change-password/', checkJwt, changePassword);
}