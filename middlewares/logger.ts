import { NextFunction, Request, Response } from "express";

export default function logger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(
    `${req.protocol}://${req.get("host")}${req.originalUrl} ${req.method}`,
  );
  next();
}
