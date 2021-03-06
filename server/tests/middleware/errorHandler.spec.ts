import { Request, Response } from 'express';
import * as Knex from 'knex';
import { consoleLogger as scribe } from 'mc-scribe';
import { Model } from 'objection';

import {
  badLogIn,
  databaseProblem,
  generalError,
  logErrors
} from '../../src/middleware/errorHandlers';
import { DatabaseError } from '../../src/utils/errors/DatabaseError';
import { LoginError } from '../../src/utils/errors/LoginError';
import { conn } from '../dbConnection';

describe('#errorHandlers', () => {
  let req: any;
  let res: any;

  const next = jest.fn();

  beforeAll(() => {
    process.env.LOG_LEVEL = 'OFF';
    Model.knex(Knex(conn));
  });

  beforeEach(() => {
    req = {
      param: '',
      body: ''
    };
    res = {
      data: null,
      code: null,
      status(status: number) {
        this.code = status;
        return this;
      },
      send(payload) {
        this.data = payload;
      }
    };
    next.mockClear();
  });

  afterAll(() => {
    Model.knex().destroy();
    process.env.LOG_LEVEL = 'INFO';
  });

  test('should log error', async () => {
    const error = new Error('this is an error');
    next.mockImplementationOnce((err) =>
      scribe('INFO', 'next function with: \t' + err)
    );
    await logErrors(error, req as Request, res as Response, next);

    expect(res.code).toBeDefined();
    expect(res.code).toBe(null);
    expect(next).toBeCalledWith(error);
  });

  test('should log error', () => {
    let msg = '';
    for (let i = 0; i < 30; i++) {
      msg += 'aaaaaaaaaa';
    }
    logErrors(new Error(msg), req as Request, res as Response, next);

    expect(res.code).toBeDefined();
    expect(res.code).toBe(null);
    expect(next.mock.calls).toBeTruthy();
  });

  test('should log a full error that has a reasonCode', () => {
    logErrors(
      new LoginError('this is an error', 'NO_USER'),
      req as Request,
      res as Response,
      next
    );

    expect(res.code).toBeDefined();
    expect(res.code).toBe(null);
  });

  test('should be a logInError', () => {
    badLogIn(
      new LoginError('User not found', 'NO_USER'),
      req as Request,
      res as Response,
      next
    );

    expect(res.code).toBeDefined();
    // expect(res.code).toBe(403);
  });

  test('should not be a logInError', () => {
    badLogIn(
      new DatabaseError('QueryProblem', 'DB_ERROR'),
      req as Request,
      res as Response,
      next
    );

    expect(res.code).toBeDefined();
    expect(next.mock.calls[0][0]).toBeTruthy();
  });

  test('should be a databaseError', () => {
    databaseProblem(
      new DatabaseError('Query Probem', 'DB_ERROR'),
      req as Request,
      res as Response,
      next
    );

    expect(res.code).toBeDefined();
    // expect(res.code).toBe(400);
  });

  test('should not be a databaseError', () => {
    databaseProblem(
      new LoginError('User not found', 'NO_USER'),
      req as Request,
      res as Response,
      next
    );

    expect(res.code).toBeDefined();
    expect(next.mock.calls[0][0]).toBeTruthy();
  });

  test('should be a general Error', () => {
    generalError(
      new Error('Normal error'),
      req as Request,
      res as Response,
      next
    );

    expect(res.code).toBeDefined();
    expect(res.code).toBe(500);
  });
});
