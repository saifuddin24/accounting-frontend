# Simple Accounting Web

**Version: 1.0.1**  
**Required API Version: [1.0.1](https://github.com/saifuddin24/accounting-backend)**

This is the frontend for the Simple Accounting system. It's a modern web application built with Vue 3 and Vite.

## Project Overview

A user interface for managing accounting records, featuring:

- **Dashboard**: Financial overview.
- **Journal Entries**: Interface for adding and viewing ledger transactions.
- **Chart of Accounts**: Comprehensive view of all accounts.
- **Reports**: Standard accounting reports (Balance Sheet, Profit & Loss).

## Getting Started

For detailed installation and configuration instructions, please refer to the:

👉 **[SETUP GUIDE](SETUP.md)**

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue Next

## Changelog

### Version 1.0.1 (2026-01-31)

- Added date range filtering to Journal History.
- Implemented inline date editing for journal entries.
- Enhanced "Quick Entry" page with improved layout and "Other transactions" section.
- Added Searchable Select component for better user experience.
- Standardized date display format to `[dd-MMM-yyyy]` throughout the app.
- Added Journal Entry show page with delete functionality.
- Fixed various UI bugs in General Ledger and Ledger Reports.
- Synchronized filter parameters with URL query strings.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar).
