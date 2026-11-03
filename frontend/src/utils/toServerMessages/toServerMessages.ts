import type { Action } from "@/stores/allObjects/allObjects";
import { deleteMessage, drawMessage } from "../socketMessages/socketMessages";

export const toServerMessages = (action: Action): string[][] => {
  if (action.type === "replace") {
    return [
      ...action.before.map((obj) => deleteMessage(obj.objId)),
      ...action.after.map((obj) => drawMessage(obj)),
    ];
  }

  const { objects, type } = action;

  return objects.map((obj) => {
    switch (type) {
      case "add": {
        return drawMessage(obj);
      }
      case "remove": {
        return deleteMessage(obj.objId);
      }
    }
  });
};
