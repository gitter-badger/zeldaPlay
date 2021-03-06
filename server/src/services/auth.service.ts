import { NextFunction, Request, Response } from 'express';
import { consoleLogger as scribe } from 'mc-scribe';

import { verifyToken } from '../utils/jwt';

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  scribe(
    'DEBUG',
    'cookies',
    req.cookies,
    'headers[cookie]',
    req.headers['cookie'],
    'req.headers',
    req.headers
  );
  if (req.headers['cookie']) {
    scribe('DEBUG', 'Logged in');
    return next();
  }
  scribe('DEBUG', 'Not logged in');
  next(new Error('Not logged in.'));
}

export function verifyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    scribe('INFO', 'Verifying the token.');
    verifyToken(req.headers.authorization.split(' ')[1], {
      id: req.params.userId,
      url: req.hostname
    });
    scribe('INFO', 'Token has been verified.');
    next();
  } catch (err) {
    next(err);
  }
}
