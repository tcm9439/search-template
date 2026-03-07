import * as vscode from "vscode";
import { SearchTemplateListSidebarProvider } from "./sidebar";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SearchTemplateListSidebarProvider.viewType,
            new SearchTemplateListSidebarProvider(context),
        ),
    );
}

export function deactivate() {}
