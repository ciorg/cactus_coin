import { Request, Response } from 'express';

export interface LogObject {
    err?: any;
    req?: Request;
    res?: Response;
}
