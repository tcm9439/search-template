# Search Template

Save and reuse sets of search filters (include/exclude globs) and apply them to VS Code's "Find in Files". Provides a sidebar to create, name, and persist search templates per workspace.

## Features

- Save named search templates with `include` and `exclude` glob patterns.
- Apply a single template to the built-in "Find in Files" view.
- Select multiple templates and "Apply All" to merge include/exclude patterns.
- Templates are persisted in the workspace state (no external files required).

## Demo

![demo](https://github.com/tcm9439/search-template/blob/main/guide/demo.gif?raw=true)
1. Open the "Search Template" view in the Activity Bar.
2. Fill `Name`, `Files to include` and `Files to exclude`, then click `Save`.
3. Select a saved template and click the apply button to run Find in Files with those filters.

## Usage

![buttons](https://github.com/tcm9439/search-template/blob/main/guide/buttons.png?raw=true)
- Open the "Search Template" sidebar (Activity Bar) to view and manage templates.
- Fields:
	- `Name` — human-friendly label for the template.
	- `Files to include` — glob(s) for files to include (e.g., `src/**`).
	- `Files to exclude` — glob(s) for files to exclude (e.g., `**/node_modules/**`).
- Buttons:
	- `Save` — create or update the template.
	- `Apply` (per item) — run Find in Files with the template filters.
	- `Edit` — load the template into the input fields for modification.
	- `Delete` — remove the template from workspace storage.
	- `Multi` toggle + `Apply All` — combine selected templates and apply together.
