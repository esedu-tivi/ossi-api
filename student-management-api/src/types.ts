import { type Request } from "express";

export interface RequestWithId extends Request {
  params: {
    id: any
  }
  id: number
}
