import { defineStore } from "pinia";

type Cursor = { id: string; name: string; x: number; y: number; seenAt: number };

type State = {
  participants: Record<string, Cursor>;
};

export const useParticipantsStore = defineStore("participants", {
  state: (): State => {
    return {
      participants: {},
    };
  },
  getters: {
    list(state) {
      return Object.values(state.participants);
    },
  },
  actions: {
    moveCursor(
      param: { id: string; name: string; x: number; y: number },
      seenAt: number = Date.now(),
    ) {
      const { id } = param;

      this.participants[id] = { ...param, seenAt };
    },
    removeStale(now: number, ttl: number) {
      if (this.list.length === 0) {
        return;
      }

      this.list.forEach((p) => {
        if (now - p.seenAt > ttl) {
          delete this.participants[p.id];
        }
      });
    },
  },
});
