const vscode = acquireVsCodeApi();
let editingId = "";

function clearEditing() {
    editingId = "";
    document.getElementById("name").value = "";
    document.getElementById("include").value = "";
    document.getElementById("exclude").value = "";
}

function makeIconButton(titleText, src, onClick) {
    const btn = document.createElement("button");
    btn.className = "icon-button";
    btn.setAttribute("title", titleText);
    btn.setAttribute("aria-label", titleText);
    const img = document.createElement("img");
    img.src = src;
    img.alt = titleText;
    img.className = "icon-img";
    btn.appendChild(img);
    btn.onclick = onClick;
    return btn;
};

function renderTemplateItem(s) {
    const div = document.createElement("div");
    div.className = "item";

    const itemHeader = document.createElement("div");
    itemHeader.className = "item-header";

    const title = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = s.name;
    title.appendChild(strong);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const applySrc = window.__SEARCH_TEMPLATE__.svgCheckInline || window.__SEARCH_TEMPLATE__.svgCheck;
    const btnApply = makeIconButton("Apply", applySrc, () => {
        vscode.postMessage({ command: "apply", id: s.id });
    });
    const editSrc = window.__SEARCH_TEMPLATE__.svgEditInline || window.__SEARCH_TEMPLATE__.svgEdit;
    const btnEdit = makeIconButton("Edit", editSrc, () => {
        editingId = s.id;
        document.getElementById("name").value = s.name;
        document.getElementById("include").value = s.include || "";
        document.getElementById("exclude").value = s.exclude || "";
    });
    const trashSrc = window.__SEARCH_TEMPLATE__.svgTrashInline || window.__SEARCH_TEMPLATE__.svgTrash;
    const btnDel = makeIconButton("Delete", trashSrc, () => {
        vscode.postMessage({ command: "delete", id: s.id });
    });

    actions.appendChild(btnApply);
    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);

    itemHeader.appendChild(title);
    itemHeader.appendChild(actions);

    const meta = document.createElement("div");
    meta.className = "meta";
    const metaInclude = document.createElement("div");
    metaInclude.className = "meta-line";
    metaInclude.textContent = `include: ${s.include || ""}`;
    const metaExclude = document.createElement("div");
    metaExclude.className = "meta-line";
    metaExclude.textContent = `exclude: ${s.exclude || ""}`;
    meta.appendChild(metaInclude);
    meta.appendChild(metaExclude);

    div.appendChild(itemHeader);
    div.appendChild(meta);
    return div;
}

function renderTemplateList(sets) {
    const listDom = document.getElementById("list");
    listDom.innerHTML = "";

    sets.forEach((s) => {
        const div = renderTemplateItem(s);
        listDom.appendChild(div);
    });
}

document.getElementById("save").addEventListener("click", () => {
    const set = {
        id: editingId,
        name: document.getElementById("name").value.trim(),
        include: document.getElementById("include").value.trim(),
        exclude: document.getElementById("exclude").value.trim(),
    };
    vscode.postMessage({ command: "save", set });
    clearEditing();
});

window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.type === "render") {
        renderTemplateList(msg.sets || []);
    }
});

function onLoad() {
    vscode.postMessage({ command: "on-load" });
}
onLoad();
