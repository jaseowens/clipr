import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  nativeTheme,
  screen,
  Tray,
} from "electron";
import * as path from "path";
import * as clipboard from "electron-clipboard-extended";

import Store from "electron-store";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;

let store: Store;

const createWindow = (): void => {
  store = new Store();

  // Create the browser window.
  const { size: screenSize } = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );
  const { width, height } = screenSize;
  mainWindow = new BrowserWindow({
    height: height,
    width: width / 5,
    alwaysOnTop: true,
    frame: false,
    show: false,
    enableLargerThanScreen: true,
    x: 0,
    y: 0,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    roundedCorners: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    vibrancy: "fullscreen-ui",
    visualEffectState: "active",
  });
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("blur", () => {
    mainWindow.hide();
  });

  ipcMain.on("text-selected", (event, data) => {
    clipboard.writeText(data);
    mainWindow.hide();
  });

  mainWindow.on("ready-to-show", () => {
    const history: string[] = store.get("history") as string[];
    const deDup = new Set(history);
    console.log("PREVIOUS DATA", history);
    console.log("PREVIOUS DATA SETTIFIED", new Set(history));

    mainWindow.webContents.send("bootstrap", history);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: "undocked" });
};

let tray: Tray;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  const image = nativeImage.createFromPath(
    path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "./images/icon-dark.png"
        : "./images/icon.png"
    )
  );

  tray = new Tray(image.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Space",
      type: "normal",
      click: () => {
        createWindow();
      },
    },
  ]);

  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);

  globalShortcut.register("CommandOrControl+Shift+V", () => {
    console.log("Special Paste");
    mainWindow.show();
  });

  clipboard
    .on("text-changed", () => {
      const currentText: string = clipboard.readText();
      console.log("TEXT CHANGE?", currentText);
      // Send data to window

      mainWindow.webContents.send("text-copied", currentText);
      const history: string[] = store.get("history") as string[];
      store.set("history", [currentText, ...history]);
    })
    .on("image-changed", () => {
      const currentImage = clipboard.readImage();
      console.log("IMAGE CHANGE?", currentImage);
    })
    .startWatching();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
