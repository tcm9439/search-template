const vscode = acquireVsCodeApi();
let editingId = "";

function clearEditing() {
  editingId = "";
  document.getElementById("name").value = "";
  document.getElementById("include").value = "";
  document.getElementById("exclude").value = "";
}

function renderList(sets) {
  const listDom = document.getElementById("list");
  listDom.innerHTML = "";
  
  sets.forEach((s) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<strong>${s.name}</strong><div style="font-size:0.85em;color:#444">include: ${s.include || ""} | exclude: ${s.exclude || ""}</div>`;
    const btnApply = document.createElement("button");
    btnApply.textContent = "Apply";
    btnApply.onclick = () =>
      vscode.postMessage({ command: "apply", id: s.id });
    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.onclick = () => {
      editingId = s.id;
      document.getElementById("name").value = s.name;
      document.getElementById("include").value = s.include || "";
      document.getElementById("exclude").value = s.exclude || "";
    };
    const btnDel = document.createElement("button");
    btnDel.textContent = "Delete";
    btnDel.onclick = () => {
      vscode.postMessage({ command: "delete", id: s.id });
    };
    div.appendChild(document.createElement("div")).appendChild(btnApply);
    div.appendChild(btnEdit);
    div.appendChild(btnDel);
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
    renderList(msg.sets || []);
  }
});

function onLoad() {
  vscode.postMessage({ command: "on-load" });
}
onLoad();
