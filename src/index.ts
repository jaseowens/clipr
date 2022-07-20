import { EVENTS } from "./types";
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

type StoreType = {
  history: string[];
  userPreferences: {
    spacePosition: "left" | "right";
    theme: "light" | "dark";
  };
};

let mainWindow: BrowserWindow;
let mainWindowWidth: number;
let screenWidth: number;
let tray: Tray;
let store: Store<StoreType>;

let rightPosition: number;

const createWindow = (): void => {
  store = new Store<StoreType>({
    defaults: {
      history: [],
      userPreferences: {
        spacePosition: "left",
        theme: nativeTheme.shouldUseDarkColors ? "dark" : "light",
      },
    },
  });
  const userPreferences = store.get("userPreferences");
  nativeTheme.themeSource = userPreferences.theme;

  // Create the browser window.
  const { size: screenSize } = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );
  const { width, height } = screenSize;

  screenWidth = width;
  mainWindowWidth = width / 5;
  rightPosition = width - mainWindowWidth;

  mainWindow = new BrowserWindow({
    height: height,
    width: mainWindowWidth,
    alwaysOnTop: true,
    frame: false,
    show: false,
    enableLargerThanScreen: true,
    x:
      userPreferences.spacePosition === "left"
        ? -mainWindowWidth
        : screenWidth + mainWindowWidth,
    y: 0,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    roundedCorners: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    // fullscreen-ui
    // hud
    // selection

    vibrancy: "hud",
    visualEffectState: "active",
  });
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("blur", () => {
    hideMainWindow();
  });

  ipcMain.on(EVENTS.HANDLE_TEXT_SELECTED, (event, data) => {
    clipboard.writeText(data);
    hideMainWindow();
  });

  ipcMain.on(EVENTS.CLEAR_DATA, () => {
    store.set("history", []);
  });

  mainWindow.on("ready-to-show", () => {
    deduplicateAndPushToStore(true);

    store.onDidChange("history", (data) => {
      mainWindow.webContents.send("bootstrap", data);
    });

    store.onDidChange("userPreferences", ({ spacePosition }) => {
      mainWindow.isVisible()
        ? moveWindowOnScreen(spacePosition)
        : moveWindowOffScreen(spacePosition);
    });
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: "undocked" });
};

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

  const userPreferences = store.get("userPreferences");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Space",
      type: "normal",
      click: () => {
        showMainWindow();
      },
    },
    {
      type: "separator",
    },
    {
      label: "Space Position",
      type: "submenu",
      submenu: [
        {
          label: "Left",
          type: "radio",
          checked: userPreferences?.spacePosition === "left",
          click: () => {
            store.set("userPreferences.spacePosition", "left");
            mainWindow.setPosition(0, 0);
          },
        },
        {
          label: "Right",
          type: "radio",
          checked: userPreferences?.spacePosition === "right",
          click: () => {
            store.set("userPreferences.spacePosition", "right");
            mainWindow.setPosition(rightPosition, 0);
          },
        },
      ],
    },
    {
      label: "Theme",
      type: "submenu",
      submenu: [
        {
          label: "Dark",
          type: "radio",
          checked: userPreferences?.theme === "dark",
          click: () => {
            store.set("userPreferences.theme", "dark");
            nativeTheme.themeSource = "dark";
          },
        },
        {
          label: "Light",
          type: "radio",
          checked: userPreferences?.theme === "light",
          click: () => {
            store.set("userPreferences.theme", "light");
            nativeTheme.themeSource = "light";
          },
        },
      ],
    },
    {
      type: "separator",
    },
    {
      label: "Clear History",
      type: "normal",
      click: () => {
        store.set("history", []);
      },
    },
  ]);

  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);

  globalShortcut.register("CommandOrControl+Shift+V", () => {
    showMainWindow();
  });

  clipboard
    .on("text-changed", () => {
      const currentText: string = clipboard.readText();
      // Send data to window
      // mainWindow.webContents.send("text-copied", currentText);

      deduplicateAndPushToStore(false, currentText);
      // const history: string[] = store.get("history") as string[];
      // const newHistroy = [currentText, ...history];
      // const deDup = new Set(newHistroy);
      // store.set("history", Array.from(deDup));
    })
    .on("image-changed", () => {
      const currentImage = clipboard.readImage();
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

const moveWindowOffScreen = (position: "left" | "right") => {
  if (position === "left") {
    let xPos = -mainWindowWidth;
    mainWindow.setPosition(xPos, 0, true);
  } else {
    let xPos = screenWidth + mainWindowWidth;
    mainWindow.setPosition(xPos, 0, true);
  }
};

const moveWindowOnScreen = (position: "left" | "right") => {
  if (position === "left") {
    let xPos = 0;
    mainWindow.setPosition(xPos, 0, true);
  } else {
    mainWindow.setPosition(rightPosition, 0, true);
  }
};

const showMainWindow = () => {
  const { spacePosition } = store.get("userPreferences");
  mainWindow.show();
  moveWindowOnScreen(spacePosition);
};

const hideMainWindow = () => {
  const { spacePosition } = store.get("userPreferences");
  moveWindowOffScreen(spacePosition);
  mainWindow.hide();
};

const deduplicateAndPushToStore = (
  initial?: boolean,
  additionalData?: string
) => {
  // store.clear();
  const history: string[] = store.get("history") as string[];
  let data: string[];

  if (history && Array.isArray(history) && history.length > 0) {
    data = additionalData ? [additionalData, ...history] : history;
  } else {
    data = [additionalData];
  }

  data = data.filter((n) => n);
  data = Array.from(new Set(data));
  store.set("history", data);
  if (initial) {
    mainWindow.webContents.send("bootstrap", data);
  }
};
