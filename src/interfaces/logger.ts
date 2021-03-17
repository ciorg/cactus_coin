import { Request, Response } from 'express';

export interface LogObject {
    err?: Error;
    req?: Request;
    res?: Response;
}
