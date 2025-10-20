# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Grafana panel plugin called "Pivot Table Panel" (plugin ID: `grafana-pivot-panel`) that displays data from any Grafana data source in a simple, customizable table format. The plugin automatically renders all fields from the data source with options for headers, font size, and pagination.

## Development Commands

### Build and Development
- `npm run dev` - Build plugin in development mode with watch enabled (uses webpack)
- `npm run build` - Build plugin for production
- `npm run typecheck` - Run TypeScript type checking without emitting files

### Testing
- `npm run test` - Run Jest tests in watch mode (requires git init first)
- `npm run test:ci` - Run all tests once without watch mode (CI-friendly)
- `npm run e2e` - Run Playwright E2E tests (requires Grafana server running first)

### Code Quality
- `npm run lint` - Run ESLint with caching
- `npm run lint:fix` - Run ESLint with auto-fix and Prettier formatting

### Local Development Environment
- `npm run server` - Spin up Grafana instance via Docker Compose for local development
- Set specific Grafana version: `GRAFANA_VERSION=11.3.0 npm run server`
- The development environment runs without plugin signature verification

### Distribution
- `npm run sign` - Sign the plugin for distribution (requires Grafana Cloud API key)

## Architecture

### Core Components

**Entry Point (`src/module.ts`):**
- Exports the main `plugin` object using Grafana's `PanelPlugin` API
- Configures panel options:
  - `showHeader`: Toggle column headers on/off
  - `fontSize`: Adjustable font size (8-32px)
  - `enablePagination`: Enable/disable pagination for large datasets
  - `rowsPerPage`: Number of rows per page (10-1000)

**Main Panel Component (`src/components/SimpleTablePanel.tsx`):**
- Displays data from any Grafana data source in table format
- Automatically extracts headers from field names
- Features:
  - Sticky headers that remain visible when scrolling
  - Row hover effects for better readability
  - Smart cell formatting (numbers, dates, null values)
  - Optional pagination with navigation controls
  - Theme-aware styling using Grafana's theme system
- Uses React hooks for state management (pagination)
- Leverages Grafana's `useStyles2` and `useTheme2` hooks for consistent theming

**Types (`src/types.ts`):**
- Defines `PanelOptions` interface with display configuration options

**Legacy Components:**
- `src/components/SimplePanel.tsx` - Original example component (not used)
- `src/components/PivotTablePanel.tsx` - Previous pivot table implementation (not used)

### Data Flow

1. Plugin receives data from any Grafana data source as a `PanelProps` object
2. Extracts the first DataFrame from `data.series[0]`
3. Automatically generates table headers from field names
4. Iterates through all rows in the DataFrame
5. Applies formatting based on data type (numbers, dates, nulls)
6. Applies pagination if enabled (calculating page ranges)
7. Renders HTML table with theme-aware styles

### Configuration System

The plugin uses Grafana's `.config/` directory for build tooling (webpack, jest, eslint, typescript). These files are auto-generated and should not be modified directly. To extend configurations:

- **TypeScript:** Extend `tsconfig.json` in project root (already extends `./.config/tsconfig.json`)
- **Jest:** Extend `jest.config.js` in project root (already extends `./.config/jest.config`)
- **ESLint:** Create/modify `eslint.config.mjs` in project root
- **Webpack:** Create custom config and update package.json scripts

## Requirements

- Node.js >= 22 (specified in package.json engines)
- npm 9.6.7 (package manager)
- Grafana >= 10.4.0 (specified in plugin.json dependencies)

## Plugin Metadata

- Plugin ID: `grafana-pivot-panel`
- Plugin Type: panel
- Plugin Name: Pivot Table Panel
- Description: A Pivot Table Panel plugin for displaying data from any Grafana data source
- Author: Tespkg
- License: Apache-2.0

## Testing Notes

- Jest tests run with forced UTC timezone (`process.env.TZ = 'UTC'`) for consistency
- E2E tests use Playwright with @grafana/plugin-e2e
- E2E tests authenticate as admin user and store session in `playwright/.auth/admin.json`
- Tests should be run against a live Grafana instance (via `npm run server`)
