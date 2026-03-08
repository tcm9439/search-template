import * as vscode from "vscode";
import {
    applySearchTemplate,
    backfill,
    deleteSearchTemplate,
    EditSearchTemplate,
    SearchTemplateStorage,
    getSearchTemplates,
    getNonce,
    setSearchTemplate,
    mergeTemplates,
} from "./search_template";

export class SearchTemplateListSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "searchTemplate.searchTemplateListSidebar";
    private sets: SearchTemplateStorage = {};

    constructor(private readonly context: vscode.ExtensionContext) {
        this.sets = getSearchTemplates(context);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        const wv = webviewView.webview;
        wv.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, "src", "media")],
        };
        wv.html = this.getHtml(wv);

        const rerender = () => {
            wv.postMessage({ type: "render", sets: Object.values(this.sets) });
        };

        wv.onDidReceiveMessage(async (msg) => {
            switch (msg.command) {
                case "rerender":
                    rerender();
                    break;
                case "save": {
                    const incoming: EditSearchTemplate = msg.set;
                    await setSearchTemplate(this.context, this.sets, backfill(incoming));
                    rerender();
                    break;
                }
                case "delete": {
                    const id: string = msg.id;
                    await deleteSearchTemplate(this.context, this.sets, id);
                    rerender();
                    break;
                }
                case "apply": {
                    const set = this.sets[msg.id];
                    if (set) {
                        applySearchTemplate(set);
                    }
                    break;
                }
                case "apply-all": {
                    const ids: string[] = msg.ids || [];
                    const sets = ids.map((id) => this.sets[id]).filter(Boolean);
                    if (sets.length > 0) {
                        applySearchTemplate(mergeTemplates(sets));
                    }
                    break;
                }
            }
        });
    }

    private getHtml(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src", "media", "list.js"),
        );
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src", "media", "list.css"),
        );
        const svgCheck = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src", "media", "check.svg"),
        );
        const svgEdit = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src", "media", "edit.svg"),
        );
        const svgTrash = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "src", "media", "trash.svg"),
        );

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="${stylesUri}" rel="stylesheet">
    </head>
    <body>
        <div class="panel">
            <label for="name">Name</label>
            <input id="name" placeholder="Name" />

            <label for="include">Files to include</label>
            <div class="input-with-row">
                <input id="include" placeholder="e.g. src/**" />
            </div>

            <label for="exclude">Files to exclude</label>
            <div class="input-with-row">
                <input id="exclude" placeholder="e.g. **/node_modules/**" />
            </div>

            <div class="row">
                <button id="save">Save</button>
            </div>
        </div>
        <div class="row">
            <label class="multi-select-row">
                <input type="checkbox" id="multi-select-toggle" />
                Multi-select
            </label>
            <button id="apply-all" class="secondary-button" disabled>Apply All</button>
        </div>

        <div id="list" class="list"></div>

        <script nonce="${nonce}">
          window.__SEARCH_TEMPLATE__ = {
            svgCheck: "${svgCheck}",
            svgEdit: "${svgEdit}",
            svgTrash: "${svgTrash}"
          };
        </script>

        <script src="${scriptUri}" nonce="${nonce}"></script>
    </body>
</html>
        `;
    }
}
