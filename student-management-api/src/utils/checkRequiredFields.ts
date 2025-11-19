export const checkRequiredFields = (object: Record<string, any>, requiredFields: string[]) => {
  const keysFromObject = Object.keys(object)
  const missingFields = requiredFields.filter(key => !keysFromObject.includes(key))

  return missingFields
}
