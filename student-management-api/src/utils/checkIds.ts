import { HttpError } from "../classes/HttpError"

export const checkIds = (ids: Record<string, string | number>) => {
  for (const index in ids) {
    if (ids[index] === "" || Number.isNaN(Number(ids[index]))) {
      throw new HttpError(400, `${ids[index]} it's not number`)
    }
  }
}
