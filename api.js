(async function () {
  const endpoint = "https://api.openai.com/v1/chat/completions";
  function getHistory() {
    return JSON.parse(get("history") || "{}");
  }
  async function getRs(prompt, target = null, isUseGPT = false) {
    prompt = isUseGPT ? prompt : summariesByTextRank(prompt);
    const apiKey = get("apiKey");
    const lang = get("language") || "english";
    const maxToken = parseInt(get("maxToken")) || null;
    progress("Pending...", true);
    if (!target) {
      target = "Highlight the importants point from the summarized content which I provided you. {Don't change anything just highlight important points use html tags for beautify} in " + lang + " language";
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      //gpt-3.5-turbo-16k-0613
      //gpt-4
      body: JSON.stringify({
        model: "gpt-3.5-turbo-16k-0613",
        messages: [
          {role: "system", content: "You are an important text highlighter AI model."},
          {role: "user", content: target + prompt},
        ],
        max_tokens: maxToken, // Adjust based on your requirements
      }),
    };
    let data = await fetch(endpoint, requestOptions).then((response) => response.json());
    progress();
    return data;
  }

  let getResultButton = _$("#getresult");
  let textarea = _$("#chatbox");
  let container = _$(".text");
  let title = _$(".title");
  let firstPrompt = "";
  getResultButton.addEventListener("click", function () {
    if (textarea.value.trim()) view();
  });
  textarea.addEventListener("keyup", function (e) {
    if (e.keyCode === 13 && textarea.value.trim()) {
      view();
    }
  });
  // textarea.addEventListener("input", function () {
  //   title.value = this.value.slice(0, 100);
  // });

  async function view() {
    let title = _$(".title");
    if (!title.value.trim()) return alert("You must enter a title!"), title.focus();

    let prompt = textarea.value;
    firstPrompt = prompt;
    container.innerHTML = "Getting result...";
    let t = title.value;
    if (isURL(prompt)) {
      container.innerHTML = "Getting from url...";
      prompt = await findTermsOfServiceFromURL(prompt);
    }
    let data = await getRs(prompt);
    if (data?.error) {
      container.innerHTML = `<span red >${data.error.message}</span>`;
      container.innerHTML = "Trying another....";
      let fromSemRush = await semrushApi(prompt);
      container.innerHTML = `<div reply >${textToHtml(fromSemRush?.summary || "Error occured!")}</div>`;
      container.innerHTML += `<div prompt >${getQuestions()}</div>`;
      answareQ();
    }
    if (data.choices) {
      let generatedText = data.choices[0].message.content;
      generatedText = generatedText.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/```/g, "");
      saveHistory(t, generatedText);
      container.innerHTML = `<div reply >${textToHtml(generatedText)}</div>`;
      container.innerHTML += `<div prompt >${getQuestions()}</div>`;
      answareQ();
    }

    textarea.value = "";
    textarea.select();
  }
  // save to history
  function saveHistory(title, data) {
    if (get("isAutosave") === "true") {
      let id = parseInt(+new Date() / 1000);
      let old = getHistory();
      old[id] = {t: title, d: data};
      old = JSON.stringify(old);
      setId(id);
      set("history", old);
    }
  }
  // update history
  function updateHistory(id, data) {
    if (get("isAutosave") === "true") {
      let allHistory = getHistory(); 
      let title = allHistory[id]["t"]; 
      allHistory[id] = {t: title, d: data};
      allHistory = JSON.stringify( allHistory );
      set("history", allHistory);
      console.log("..data udpated..");
    }
  }
  function setId(id) {
    _$(".title").setAttribute("data-id", id);
  }
  function getId() {
    return _$(".title").getAttribute("data-id");
  }

  // help section
  let _home = _$(".help-home");
  let _history = _$(".help-history");
  let _config = _$(".help-config");
  _home.onclick = () => {
    help("home");
  };
  _history.onclick = () => {
    help("history");
  };
  _config.onclick = () => {
    help("config");
  };
  function help(key) {
    let data = {
      home: {t: "Home Page", s: `This is where you can input the terms and conditions you want to summarize. Don't forget to name your summary at the top for easy reference. Click "Get Result" to generate the summary, and use the "Copy" button to conveniently copy the results. Save your translated summaries with the checkbox for future access.`},
      history: {t: "History Page", s: `Explore your saved summaries here on the History page. Use the search bar at the top to find specific terms and conditions quickly. Click on any entry to review the detailed summary. Manage and organize your saved content effortlessly.`},
      config: {t: "Config Page", s: `Customize Policy Peak to suit your preferences on the Config page. Toggle the "Auto Save Output Result" checkbox to automatically save your results. Input your API key for advanced features. Select your preferred output language and fine-tune the estimated maximum word length for the summary. Tailor your experience for optimal usage.<div id='code' ><b>api key - </b> <code>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</code></div>`},
    };
    let container = _$(".popup-container");
    let title = _$(".p-title");
    let txt = _$(".p-content");
    let close = _$(".p-close");
    let selected = data[key];
    title.innerText = selected.t;
    txt.innerHTML = selected.s;
    container.classList.remove("hide");
    close.onclick = function () {
      container.classList.add("hide");
    };
    let code = _$$("code");
    code.forEach((e) => {
      e.onclick = () => navigator.clipboard.writeText(e.innerText);
    });
  }
  async function findTermsOfServiceFromURL(websiteUrl) {
    let tos = false;
    let html = await fetch(websiteUrl).then((r) => r.text());
    let parser = new DOMParser();
    html = parser.parseFromString(html, "text/html");
    var anchors = html.querySelectorAll("a");
    for (var i = 0; i < anchors.length; i++) {
      var anchor = anchors[i];
      var href = anchor.href.toLowerCase();
      if (href.includes("terms")) {
        tos = await getText();
        break;
      } else if (href.includes("tos")) {
        tos = await getText();
        break;
      } else if (href.includes("conditions")) {
        tos = await getText();
        break;
      } else if (href.includes("toc")) {
        tos = await getText();
        break;
      } else if (href.includes("privacy")) {
        tos = await getText();
        break;
      } else if (href.includes("policy")) {
        tos = await getText();
        break;
      }
      async function getText() {
        let uri = "";
        if (!isURL(href)) {
          //console.log("this is not a url:", href);
          uri += url(websiteUrl).origin + anchor.pathname;
          //console.log(uri);
          href = "";
        } else {
          //console.log("this is an url:", anchor.href);
        }
        tos = await fetch(href || uri).then((r) => r.text());
        tos = parser.parseFromString(tos, "text/html");
        tos = tos.body.innerText;
        return tos;
      }
    }
    firstPrompt = tos;
    return tos;
  }
  function isURL(sentence) {
    const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi;
    const matches = sentence.match(urlRegex);
    return matches !== null && matches.length === 1 && matches[0] === sentence.trim();
  }
  async function semrushApi(txt) {
    if (!txt) alert("TOS is required");
    let endpoint = "https://www.semrush.com/goodcontent/api/summary-generator/generate-summary/";
    let result = "";
    result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `format=bullets&length_penalty=0&text=${txt}`,
    })
      .then((r) => r.json())
      .catch((e) => {
        result = e;
      });
    return result;
  }
  function textToHtml(text) {
    // Split the text into individual items based on the '-' character
    const items = text
      .split("-")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    // Construct the HTML list
    let html = "<ul>";
    items.forEach((item) => {
      html += `<li>${item}</li>`;
    });
    html += "</ul>";

    return html;
  }
  function url(url) {
    let u = new URL(url);
    return u;
  }
  function summariesByTextRank(txt) {
    var textRank = new textrank(txt, {extractAmount: 3});
    return textRank.summarizedArticle;
  }
  function getQuestions() {
    return `<br> <div class="quetions">
    <button>What information is collected about users?</button>
    <button>How is this information collected (e.g., through website visits, forms, cookies)?</button>
    <button>Is the collection of personal information necessary for the service or website to function?</button>
    <button>How is the collected information stored and protected?</button>
    <button>Are there any third parties with whom user data is shared? If so, for what purposes?</button>
    <button>Is the data used for marketing or advertising purposes? If yes, how can users opt out?</button>
    <button>Are users able to access and update their personal information?</button>
    <button>What measures are in place to protect user privacy in case of a data breach?</button>
    <button>Are there any legal obligations or regulations governing the handling of user data?</button>
    <button>How can users contact the company or service provider with privacy concerns or inquiries?</button>
</div>`;
  }
  function answareQ() {
    let allQBtn = document.querySelectorAll(".quetions button");
    allQBtn.forEach((e) => {
      e.onclick = async function () {
        let target = "{Don't repeat which I gave to you, just answare the quetion.}";
        let q = this.value || this.innerText;
        // let prompt = document.querySelector(".text div[reply]")?.innerText || "";
        let response = await getRs(`${q} on this text: "${firstPrompt}"`, target, true);
        if (response.choices) {
          response = response.choices[0].message.content;
          container.innerHTML += `<div reply ><div q>${q}</div>${textToHtml(response)}</div>`;
          answareQ();
        } else {
          container.innerHTML += `<p style='color:Red' >${response.error.message}</p>`;
          answareQ();
        }
        container.scrollTop = container.scrollHeight; 
        updateHistory(getId(), getReplies());
        progress();
      };
    });
  }
  progress();
  function progress(t = "Get Result", isDisabled = false) {
    let btn = document.querySelector("#getresult");
    let area = document.querySelector("#chatbox");
    btn.innerText = t;
    btn.disabled = isDisabled;
    area.disabled = isDisabled;
  }
  function getReplies() {
    let els = _$$("div[reply]");
    let text = "";
    els.forEach((e) => {
      text += e.innerText + "\n\n";
    });
    return text;
  }
})();
