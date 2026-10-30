import type { Action } from "@/stores/allObjects/allObjects";

export const toServerMessages = (action: Action): string[][] => {
  const { objects, type } = action;

  return objects.map((obj) => {
    return type === "add"
      ? ["drawObj", JSON.stringify(obj)]
      : ["delete", JSON.stringify({ objId: obj.objId })];
  });
};
