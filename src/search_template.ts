import * as vscode from "vscode";

const STORAGE_KEY = "searchTemplates";

export type EditSearchTemplate = {
    id?: string
    name?: string
    include?: string
    exclude?: string
}

export type SearchTemplate = {
    id: string
    name: string
    include?: string
    exclude?: string
}

export type SearchTemplateStorage = {
    [id: string]: SearchTemplate
}

export function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function applySearchTemplate(set: SearchTemplate) {
    const args = {
        filesToInclude: set.include || "",
        filesToExclude: set.exclude || "",
        triggerSearch: false,
    };
    vscode.commands.executeCommand("workbench.action.findInFiles", args);
}

export function getSearchTemplates(context: vscode.ExtensionContext): SearchTemplateStorage {
    return context.workspaceState.get<SearchTemplateStorage>(STORAGE_KEY, {});
}

function saveSearchTemplates(context: vscode.ExtensionContext, sets: SearchTemplateStorage) {
    return context.workspaceState.update(STORAGE_KEY, sets);
}

export function deleteSearchTemplate(context: vscode.ExtensionContext, currentSets: SearchTemplateStorage, id: string) {
    delete currentSets[id];
    return saveSearchTemplates(context, currentSets);
}

export function setSearchTemplate(
    context: vscode.ExtensionContext,
    currentSets: SearchTemplateStorage,
    set: SearchTemplate,
) {
    currentSets[set.id] = set;
    return saveSearchTemplates(context, currentSets);
}

export function backfill(set: EditSearchTemplate): SearchTemplate {
    return {
        id: set.id || getNonce(),
        name: set.name || "Untitled",
        include: set.include,
        exclude: set.exclude,
    };
}
