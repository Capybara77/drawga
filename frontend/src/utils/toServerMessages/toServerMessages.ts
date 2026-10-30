import type { Action } from "@/stores/allObjects/allObjects";

export const toServerMessages = (action: Action): string[][] => {
  const { objects, type } = action;

  return objects.map((obj) => {
    switch (type) {
      case "add": {
        return ["drawObj", JSON.stringify(obj)];
      }
      case "remove": {
        return ["delete", JSON.stringify({ objId: obj.objId })];
      }
    }
  });
};
