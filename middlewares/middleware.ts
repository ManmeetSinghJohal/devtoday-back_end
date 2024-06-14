import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

export enum ValidationType {
  BODY = "body",
  PARAMS = "params",
  QUERY = "query",
}

export function validate(schema: AnyZodObject, type: ValidationType) {
  return (req: Request, res: Response, next: NextFunction) => {
    let data;
    switch (type) {
      case ValidationType.BODY:
        data = req.body;
        break;
      case ValidationType.PARAMS:
        data = req.params;
        break;
      case ValidationType.QUERY:
        data = req.query;
        break;
      default:
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Invalid validation type" });
    }
    try {
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => {
          const label = issue.path.length > 1 ? issue.path[1] : issue.path[0];
          return { message: `${label}: ${issue.message}` };
        });
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid data", details: errorMessages });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    }
  };
}
