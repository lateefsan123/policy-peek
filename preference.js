// pagination functions
pagination();
function pagination() {
  // get all the page list
  const allPage = _$$(".page");
  //   get all navigation button
  const allButton = _$$(".nav-btn");
  //   get pre-selected page/button
  const selectedPage = get("page");
  if (selectedPage) {
    // de-select all page
    deselectall();
    // show pre-selected page
    let sbtn = _$(`button[value='${selectedPage}']`);
    let page = _$(`.${selectedPage}`);
    sbtn.classList.add("selected");
    page.classList.remove("hide");
  }
  //   navigation function
  allButton.forEach((e) => {
    // change page
    e.addEventListener("click", function () {
      deselectall();
      if (this.value === "history") {
        loadHistory();
      }
      e.classList.add("selected");
      let selected = _$(`.${this.value}`);
      //   track selected page
      set("page", this.value);
      selected.classList.remove("hide");
    });
  });
  //   de-selecte all page/button function
  function deselectall() {
    allPage.forEach((e) => e.classList.add("hide"));
    allButton.forEach((e) => e.classList.remove("selected"));
  }
}

// copy to clipboard

copyText();
function copyText() {
  let copyButton = _$("#copy-text");
  let selectAbleContainer = _$(".text");
  copyButton.addEventListener("click", function () {
    navigator.clipboard.writeText(selectAbleContainer.innerText);
    copyButton.innerText = "Copied!";
    setTimeout(() => {
      copyButton.innerText = "Copy";
    }, 1000);
  });
}

// is auto save
isAutoSave();
function isAutoSave() {
  let checkbox = _$("#isAutosave");
  let key = "isAutosave";
  let oldv = get(key);
  if (oldv == "true") checkbox.checked = true;
  checkbox.addEventListener("click", function () {
    set(key, this.checked);
  });
}

// save api key
saveApiKey();
function saveApiKey() {
  let apiInput = _$("#api-key");
  let key = "apiKey";
  let oldv = get(key);
  apiInput.value = oldv;
  let timeout;
  apiInput.addEventListener("input", function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      set(key, this.value);
    }, 100);
  });
}

// save lanague

saveLang();

function saveLang() {
  let el = _$("#language");
  let key = "language";
  let oldv = get(key) || "English";

  el.value = oldv;
  el.addEventListener("change", function () {
    set(key, this.value);
  });
}

// maxtoken

maxToken();
function maxToken() {
  let input = _$("#maxtoken");
  let key = "maxToken";
  let oldv = get(key);
  input.value = parseInt(oldv);
  let timeout;
  input.addEventListener("input", function () {
    let v = this.value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      set(key, v);
    }, 100);
  });
}

// load history
loadHistory();
function loadHistory() {
  let container = _$(".history-container");
  let history = JSON.parse(get("history") || "{}");
  let html = "";
  let indexs = Object.keys(history).reverse();
  for (let i = 0; i < indexs.length; i++) {
    let id = indexs[i];
    let h = history[id];
    html += `<div class="e-history">
                <div class="h">
                    ${h.t}
                </div>
                <div class="h-action">
                    <button value='${id}' class="h-download">Download</button>
                    <button value='${id}' class="h-expand">Expend</button>
                    <button value='${id}' class="h-delete">Del</button>
                </div>
            </div>`;
  }
  container.innerHTML = html;
  searchHistory();
  expendDelete();
  clearHistory();
}

// search history
function searchHistory() {
  let input = _$("#historySearch");
  let allDiv = _$$(".e-history .h");
  let timeout;
  input.addEventListener("input", function () {
    clearTimeout(timeout);
    let q = this.value;
    timeout = setTimeout(() => {
      allDiv.forEach((e) => {
        e.parentElement.classList.add("hide");
        if (e.innerText.toLowerCase().includes(q.toLowerCase())) {
          e.parentElement.classList.remove("hide");
        }
      });
    }, 200);
  });
}
// get history function
function getHistory() {
  return JSON.parse(get("history") || "{}");
}
// expend/delete
function expendDelete() {
  let del = _$$(".h-delete");
  let expend = _$$(".h-expand");
  let donwload = _$$(".h-download");
  _download(donwload);
  // delete function
  del.forEach((e) => {
    e.onclick = function () {
      if (!confirm("Are you sure?")) return;
      let history = getHistory();
      delete history[this.value];
      set("history", JSON.stringify(history));
      e.parentElement.parentElement.remove();
    };
  });
  // expend function
  expend.forEach((e) => {
    e.onclick = function () {
      let id = this.value;
      //console.log(id);
      let container = e.parentElement.parentElement.querySelector(".h");
      let history = getHistory();
      if (container.classList.contains("expanded")) {
        container.classList.remove("expanded");
        container.innerHTML = history?.[id].t;
        e.innerText = "Expend";
      } else {
        container.classList.add("expanded");
        container.innerHTML = history?.[id].d;
        e.innerText = "Show Less";
      }
    };
  });
}
// download history
function _download(els) {
  els.forEach((e) => {
    e.onclick = function () {
      let history = getHistory()[this.value];
      let parser = new DOMParser();
      let html =  parser.parseFromString(history.d, 'text/html');
      let data = html.body.innerText;
      downloadText(history.t, data);
    };
  });
}

// clear history
function clearHistory() {
  let btn = _$(".h-clear-all");
  let container = _$(".history-container");
  btn.onclick = function () {
    if (confirm("Do you want to clear history?")) {
      set("history", "{}");
      container.innerHTML = "";
    }
  };
}

// donwload text
function downloadText(filename, text) {
  const blob = new Blob([text], {type: "text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

// donwload from chat
downloadFromChat();
function downloadFromChat() {
  let btn = _$("#download"); 
  let title = _$(".title");
  btn.onclick = function () {
    let replies = _$$(".text div[reply]");
    if(!title.value.trim()) return alert("Nothing to download!");
    html = "";
    replies?.forEach((e) => {
      html += e.innerText + "\n\n";
    });
    downloadText(title.value, html);
  };
}
