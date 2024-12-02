# Tab Fuzzy Finder

A VS Code extension that allows you to quickly fuzzy find and switch between open tabs, with smart previous tab tracking.

## Features

- Quick fuzzy search through all open tabs
- Smart previous tab tracking:
  - `↩` indicates your previous tab
  - `●` indicates your current tab
- Automatically tracks tab switches, even when using mouse or other commands
- Works across all tab groups (split views)
- Shows tab group information in the quick pick menu

## Usage

### Keyboard Shortcut
- macOS: `Cmd + E`
- Windows/Linux: `Ctrl + E`

### Command Palette
1. Press `Cmd/Ctrl + Shift + P` to open the command palette
2. Type "Find Open Tab" and select the command

### Tab Switching
1. Use the keyboard shortcut or command to open the tab finder
2. Your previous tab will be at the top of the list (marked with ↩)
3. Your current tab will be marked with ●
4. Start typing to fuzzy search through your tabs
5. Press Enter to switch to the selected tab

## Tab History
The extension maintains a smart history of your tab switches:
- When you switch from tab A to tab B, tab A becomes the "previous" tab
- When you switch to tab C, tab B becomes the "previous" tab
- This works regardless of how you switch tabs (mouse, keyboard, commands)

## Requirements

- VS Code 1.80.0 or higher

## Development

1. Clone this repository
2. Run `npm install`
3. Press F5 to start debugging
4. Use `Cmd/Ctrl + E` or the command "Find Open Tab" to test

## Building

To build the extension:

```bash
npm run compile
npm run package
```