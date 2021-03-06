import { Express, NextFunction, Request, Response, Router } from 'express';

import { isLoggedIn, verifyMiddleware } from '../services/auth.service';
import {
  getAll,
  getOne,
  getUserCharacters as getUserDBCharacter,
  newWeapon,
  updateOne
} from '../services/character.service';
import { DatabaseError } from '../utils/errors/DatabaseError';

const router = Router();

router.get('/characters', allCharacters);
router.get('/characters/:id', getCharacter);
router.get(
  '/characters/user/:userId',
  isLoggedIn,
  verifyMiddleware,
  getUserCharacters
);
router.post(
  '/characters/:userId',
  isLoggedIn,
  verifyMiddleware,
  upsertCharacter
);

export function CharacterRouter(app: Express, path: string) {
  app.use(path, router);
}

/**
 * Function for retrieving all character. Called when viewing homepage, but not logged in
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Next function for handling errors
 */
async function allCharacters(req: Request, res: Response, next: NextFunction) {
  try {
    const characters = await getAll();
    res.json(characters);
  } catch (err) {
    if (!(err instanceof DatabaseError)) {
      const tempErr = new DatabaseError(err.message, 'DB_ERROR');
      tempErr.stack = err.stack;
      err = tempErr;
    }
    next(err);
  }
}

/**
 * Function for retrieving one character. Called when clicking specified character
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Next function for handling errors
 */
async function getCharacter(req: Request, res: Response, next: NextFunction) {
  try {
    const character = await getOne(req.params.id);
    res.status(200).json(character);
  } catch (err) {
    if (!(err instanceof DatabaseError)) {
      err = new DatabaseError(err.message, 'DB_ERROR');
    }
    next(err);
  }
}

/**
 * Function for retrieving updating one character. Called when click "save to database"
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Next function for handling errors
 */
async function upsertCharacter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const character = await updateOne(req.params.userId, req.body.character);
    res.status(200).json(character);
  } catch (err) {
    if (!(err instanceof DatabaseError)) {
      const newErr = new DatabaseError(err.message, 'DB_ERROR');
      newErr.stack = err.stack;
      err = newErr;
    }
    next(err);
  }
}

/**
 * Function for retrieving all of one user's character. Called when viewing homepage and not logged in
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Next function for handling errors
 */
async function getUserCharacters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const characters = await getUserDBCharacter(req.params.userId);
    res.status(200).json(characters);
  } catch (err) {
    if (!(err instanceof DatabaseError)) {
      const newErr = new DatabaseError(err.message, 'DB_ERROR');
      newErr.stack = err.stack;
      err = newErr;
    }
    next(err);
  }
}
