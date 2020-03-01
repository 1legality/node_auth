import { createConnection } from 'typeorm';
import express from 'express';
import withJson from 'express-with-json'
import glob from 'glob';
import path from 'path';
import bodyParser from 'body-parser';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import passport from "passport";

const port = 3000;

function findAllControllers(): any {
 return glob
   .sync(path.join(__dirname, 'controllers/*'), { absolute: true })
   .map(controllerPath => require(controllerPath).default)
   .filter(applyController => applyController);
}

function errorHandler(error, req, res, next): void {
 if (!error) {
   return next();
 }


 if (error) {
   res.status(500);
   res.json({ error: error.message });
 }
 console.error(error);
}

export function entityNotFoundErrorHandler(error, req, res, next): Promise<void> {
 if (!(error instanceof EntityNotFoundError)) {
   return next(error);
 }

 res.status(401);
 res.json({ error: 'Not Found' });
}

export async function bootstrap(): Promise<any> {
 await createConnection();
 require('./config/Passport');

 const app = withJson(express());
 app.use(bodyParser.json());

 // Initialize Passport and restore authentication state, if any, from the
 // session.
 app.use(passport.initialize());
 app.use(passport.session());

 findAllControllers().map(applyController => applyController(app));
 app.use(entityNotFoundErrorHandler);
 app.use(errorHandler);

 app.listen(port, () => console.log('Listening on port', port));

 return app;
}