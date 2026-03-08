# Search Filter Set (search-template)

Save and reuse sets of search filters (include/exclude globs) and apply them to VS Code's "Find in Files". Provides a sidebar to create, name, and persist search templates per workspace.

## Features

- Save named search templates with `include` and `exclude` glob patterns.
- Apply a single template to the built-in "Find in Files" view.
- Select multiple templates and "Apply All" to merge include/exclude patterns.
- Templates are persisted in the workspace state (no external files required).

## Quick Demo

1. Open the "Search Template" view in the Activity Bar.
2. Fill `Name`, `Files to include` and `Files to exclude`, then click `Save`.
3. Select a saved template and click the apply button to run Find in Files with those filters.
4. Toggle multi-select to apply a combination of templates.

## Usage

- Open the "Search Template" sidebar (Activity Bar) to view and manage templates.
- Fields:
	- `Name` — human-friendly label for the template.
	- `Files to include` — glob(s) for files to include (e.g., `src/**`).
	- `Files to exclude` — glob(s) for files to exclude (e.g., `**/node_modules/**`).
- Buttons:
	- `Save` — create or update the template.
	- `Apply` (per item) — run Find in Files with the template filters.
	- `Delete` — remove the template from workspace storage.
	- `Multi` toggle + `Apply All` — combine selected templates and apply together.

## Extension Settings

This extension does not contribute any configurable settings.

## License

MIT
