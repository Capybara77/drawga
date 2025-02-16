import { useWebSocket, type UseWebSocketReturn } from '@vueuse/core';

// export const useDrawgaWebSocket = (): UseWebSocketReturn<any> => {
//   const location: Location = window.location;
//   const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
//   const newUri = `${protocol}//${location.host}${location.pathname}/ws${location.search}`;

//   return useWebSocket(newUri);
// };
