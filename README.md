# Clipr

Clipr is a super simple, free, MacOS clipboard manager.

## Warning

There is currently a breaking bug, copying more than one image causes the application to hang. Do not recommend using this until this is resolved.

## Usage

Open Clipr Space (displays copy history)

`Ctrl + Shift + V`

Tray Icon (top menu bar) contains preferences

## Features

- Light/dark mode
- Native look and feel
- Simplistic UI and minimal setup
- Unlimited history (maybe? lol)

## Screenshots

Empty List
![Empty List](https://i.imgur.com/tLII7u1.jpg)
Populated List
![Populated List](https://i.imgur.com/rKXKUxI.png)
Picking Previous Copy
![Picking Previous Copy](https://i.imgur.com/S62gQDY.png)
Light Mode
![Light Mode](https://i.imgur.com/veneNJG.png)

## Installation

Install dependencies

```bash
  yarn
```

Create package

```bash
  yarn make
```

A folder 'out' will be created. This folder will contain another folder 'make' that will contain a dmg to install.

## Local Development

Install dependencies

```bash
  yarn
```

Create package

```bash
  yarn start
```

## Roadmap

- [ ] Image detection and image preview
- [ ] Link detection and link previews
- [ ] Color detection and color preview
- [ ] Add more integrations
- [ ] More preferences
- [ ] Custom shortcut(s)
- [ ] _More performant clipboard listener_
