import type { BaseObject } from "@/constructors";

export const drawMessage = (obj: BaseObject | undefined) => {
  return ["drawObj", JSON.stringify(obj)].map(String);
};

export const tempMessage = (obj: BaseObject) => {
  return ["temp", JSON.stringify(obj)];
};
export const deleteMessage = (objId: string) => {
  return ["delete", JSON.stringify({ objId })];
};
export const cursorMessage = (userId: string, x: number, y: number, userName: string) => {
  return ["cur", userId, x, y, userName].map(String);
};
export const clearMessage = () => {
  return ["clear"];
};
