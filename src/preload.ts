import { EVENTS } from "./types";
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  bootstrap: (callback: any) => {
    return ipcRenderer.on(EVENTS.BOOTSTRAP, callback);
  },
  handleTextSelected: (title: any) =>
    ipcRenderer.send(EVENTS.HANDLE_TEXT_SELECTED, title),
  clearData: (data: any) => ipcRenderer.send(EVENTS.CLEAR_DATA, data),
});
