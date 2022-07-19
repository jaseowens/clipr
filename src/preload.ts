// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  bootstrap: (callback: any) => {
    console.log("DO YOU SEE ME?? --------", callback);
    return ipcRenderer.on("bootstrap", callback);
  },
  handleTextCopied: (callback: any) => {
    return ipcRenderer.on("text-copied", callback);
  },
  handleTextSelected: (title: any) => ipcRenderer.send("text-selected", title),
});
