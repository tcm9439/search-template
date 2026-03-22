const vscode = acquireVsCodeApi();

let editingId = "";
const selectedIds = new Set();
let multiSelectMode = localStorage.getItem("multiSelectMode") === "true";
let focusedIndex = -1;
let hasPressedArrowKey = false;
let templateIds = [];

function makeIconButton(titleText, src, onClick) {
    const btn = document.createElement("button");
    btn.className = "icon-button";
    btn.setAttribute("title", titleText);
    btn.setAttribute("aria-label", titleText);
    btn.onclick = onClick;
    inlineSvgAndReplace(src, btn);
    return btn;
};

async function inlineSvgAndReplace(url, container) {
    try {
        const res = await fetch(url);
        const parser = new DOMParser();
        const doc = parser.parseFromString(await res.text(), 'image/svg+xml');
        const svg = doc.querySelector('svg');
        svg.classList.add('icon-img-svg');
        container.appendChild(svg);
    } catch (e) { }
}

function clearEditing() {
    editingId = "";
    document.getElementById("name").value = "";
    document.getElementById("include").value = "";
    document.getElementById("exclude").value = "";
}

function updateApplyAllButton() {
    const btn = document.getElementById("apply-all");
    btn.disabled = selectedIds.size === 0;
}

function toggleMultiSelect(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    updateApplyAllButton();
}

function renderTemplateItem(s, index) {
    const div = document.createElement("div");
    div.className = "item";
    div.setAttribute("data-index", index);
    div.setAttribute("tabindex", "-1");
    div.onclick = (e) => {
        if (multiSelectMode) {
            toggleMultiSelect(s.id);
            vscode.postMessage({ command: "rerender" });
        } 
    };

    const itemHeader = document.createElement("div");
    itemHeader.className = "item-header";

    const title = document.createElement("div");
    title.className = "title";
    const strong = document.createElement("strong");
    strong.textContent = s.name;
    strong.style.cursor = "pointer";
    strong.onclick = (e) => {
        if (!multiSelectMode) {
            e.stopPropagation(); // Prevent item click
            vscode.postMessage({ command: "apply", id: s.id });
        }
    };
    title.appendChild(strong);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    if (multiSelectMode) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = selectedIds.has(s.id);
        checkbox.onclick = (e) => {
            e.stopPropagation(); // Prevent item click
        };
        checkbox.onchange = (e) => {
            e.stopPropagation();
            toggleMultiSelect(s.id);
        };
        actions.appendChild(checkbox);
    } else {
        const btnApply = makeIconButton("Apply", window.__SEARCH_TEMPLATE__.svgCheck, (e) => {
            e.stopPropagation();
            vscode.postMessage({ command: "apply", id: s.id });
        });
        const btnEdit = makeIconButton("Edit", window.__SEARCH_TEMPLATE__.svgEdit, (e) => {
            e.stopPropagation();
            editingId = s.id;
            document.getElementById("name").value = s.name;
            document.getElementById("include").value = s.include || "";
            document.getElementById("exclude").value = s.exclude || "";
        });
        const btnDel = makeIconButton("Delete", window.__SEARCH_TEMPLATE__.svgTrash, (e) => {
            e.stopPropagation();
            vscode.postMessage({ command: "delete", id: s.id });
        });
    
        actions.appendChild(btnApply);
        actions.appendChild(btnEdit);
        actions.appendChild(btnDel);
    }

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
    templateIds = sets.map(s => s.id);
    sets.forEach((s, index) => {
        const div = renderTemplateItem(s, index);
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

function setMultiSelectMode(newMode) {
    multiSelectMode = newMode;
    localStorage.setItem("multiSelectMode", multiSelectMode);
    document.getElementById("multi-select-toggle").checked = multiSelectMode;
    selectedIds.clear();
    focusedIndex = -1;
    hasPressedArrowKey = false;
    updateApplyAllButton();
    vscode.postMessage({ command: "rerender" });
}

document.getElementById("multi-select-toggle").addEventListener("change", (e) => {
    setMultiSelectMode(e.target.checked);
});

document.getElementById("apply-all").addEventListener("click", () => {
    vscode.postMessage({ command: "apply-all", ids: Array.from(selectedIds) });
});

function updateFocusedItem() {
    const items = document.querySelectorAll(".item");
    items.forEach((item, index) => {
        if (hasPressedArrowKey && index === focusedIndex) {
            item.classList.add("keyboard-focused");
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else {
            item.classList.remove("keyboard-focused");
        }
    });
}

function handleKeyboardNavigation(e) {
    const items = document.querySelectorAll(".item");
    if (items.length === 0) { return; }

    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
        e.preventDefault();
    } else {
        return;
    }
    const activeElementTagName = document.activeElement.tagName;
    if (activeElementTagName === "BUTTON" && e.key === "Enter") {
        return;
    }
    if (["BUTTON", "INPUT", "TEXTAREA"].includes(activeElementTagName)) {
        document.activeElement.blur();
    }
    switch (e.key) {
        case "ArrowDown":
            if (!hasPressedArrowKey) {
                hasPressedArrowKey = true;
                focusedIndex = 0;
            } else if (focusedIndex < templateIds.length - 1) {
                focusedIndex++;
            }
            updateFocusedItem();
            break;
        case "ArrowUp":
            if (!hasPressedArrowKey) {
                hasPressedArrowKey = true;
                focusedIndex = 0;
            } else if (focusedIndex > 0) {
                focusedIndex--;
            }
            updateFocusedItem();
            break;
        case "ArrowLeft":
            setMultiSelectMode(!multiSelectMode);
            break;
        case "ArrowRight":
            if (multiSelectMode && selectedIds.size > 0) {
                vscode.postMessage({ command: "apply-all", ids: Array.from(selectedIds) });
            }
            break;
        case "Enter":
            if (multiSelectMode) {
                const id = templateIds[focusedIndex];
                toggleMultiSelect(id);
                vscode.postMessage({ command: "rerender" });
            } else {
                const id = templateIds[focusedIndex];
                vscode.postMessage({ command: "apply", id });
            }
            break;
    }
}

window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.type === "render") {
        renderTemplateList(msg.sets || []);
    }
});
document.addEventListener("keydown", handleKeyboardNavigation);

function onLoad() {
    document.getElementById("multi-select-toggle").checked = multiSelectMode;
    vscode.postMessage({ command: "rerender" });
}
onLoad();
