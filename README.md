# ChatGPT Desktop Notifier

> This project was created to test Roo-Cline, an AI coding assistant.

A Chrome extension that sends desktop notifications when ChatGPT completes its response.

[日本語のREADME](./README.ja.md)

## Features

- Desktop notifications when ChatGPT completes its response
- Sound notification toggle
- Desktop notification toggle
- Configurable notification display duration (1-60 seconds)
- Adjustable response completion detection delay (1-10 seconds)
- Test functionality
  - Sound notification test
  - Desktop notification test

## Popup Interface

<img width="311" alt="Screenshot 2025-01-18 13 44 44" src="https://github.com/user-attachments/assets/ac4dcc2e-6b14-4264-92bf-c8dd7b09e4c8" />

## Development Setup

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (v6 or higher recommended)

### Installation

```bash
# Install dependencies
npm install
```

### Build Instructions

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev

# Clean build files
npm run clean
```

### Loading as Chrome Extension

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode" in the top right
3. Click "Load unpacked extension"
4. Select the `dist` directory

## Project Structure

```
.
├── src/
│   ├── background.js    # Background script
│   ├── content.js       # Content script
│   ├── icons/          # Icon files
│   │   ├── icon.svg
│   │   └── icon128.png
│   ├── popup/          # Popup UI related
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── utils/          # Utilities
│       └── sound.js    # Sound notification related
├── webpack-plugins/    # Webpack plugins
│   └── version-incrementer.js
├── manifest.json       # Extension manifest (Manifest V3)
├── webpack.config.js   # Webpack configuration
└── package.json       # Project configuration
```

## Feature Details

### Notification Settings

- **Sound Alert**: Enable/disable sound notification when response is complete
- **Desktop Alert**: Enable/disable desktop notifications
- **Notification Duration**: Set how long desktop notifications are displayed (1-60 seconds)
- **Response Completion Delay**: Set the delay for detecting ChatGPT's response completion (1-10 seconds)

### Test Functions

- **Test Sound**: Play a test sound notification with current settings
- **Test Notification**: Display a test desktop notification with current settings

## License

ISC
