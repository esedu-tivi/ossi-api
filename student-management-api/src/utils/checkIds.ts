import { HttpError } from "../classes/HttpError.js"

export enum NeededType {
  STRING = "string",
  NUMBER = "number"
}

export const checkIds = (ids: Record<string, string | number | string[]> | string[], type: NeededType) => {
  // If ids is an array
  if (Array.isArray(ids) && ids.length) {
    if (!ids.every((id) => typeof id === type || (type === NeededType.NUMBER && typeof id === "string" && !Number.isNaN(Number(id))))) {
      throw new HttpError(400, `some field is not of expected '${type}' type`);
    }

  } else if (typeof ids === "object" && ids !== null) {
    // If ids is an object
    for (const key in ids) {
      const value = ids[key];

      if (type === NeededType.NUMBER) {
        if (typeof value !== "number" && (typeof value !== "string" || Number.isNaN(Number(value)) || value === "")) {
          throw new HttpError(400, `${value} value is not excepted '${type}' type`);
        }
      }
      if (type === NeededType.STRING) {
        if (typeof value !== "string") {
          throw new HttpError(400, `${value} value is not excepted '${type}' type`);
        }
      }
      if (value === "") {
        throw new HttpError(400, `${key} is empty string`)
      }
    }
  } else {
    throw new HttpError(400, "ids must be an array or object");
  }
}
