const base = "https://script.google.com/macros/s/AKfycbx0uZv2hur7IIFIO9vl0z2rteLcGbmA8ZIpabdi1XcLXnfsLXVnsKihd8QQMgly5zAN/exec?GSheet=https://docs.google.com/spreadsheets/d/1OUjljb3Xa-9ZKMXsmWBFYooffbRPLKAIwIGLXDDPLAE/edit"

function updateEditButtons() {
   const elements = document.getElementsByClassName('awt-button edit');
    for (const element of elements) {
        element.onclick = function(event) {
            event.preventDefault();
            let airtableID = this.href.split(":")[1];
            editElement(airtableID);
        }
    }
}

async function getUpdatableCols(key) {
    let url = base + "&type=getFields&key=" + key;
    let response = await fetch(url);
    let result = await response.text();
    let asString = String(result);
    let cols = asString.split(',');
    return cols;
}

async function editElement(key) {
    let labels = await getUpdatableCols(key);
    let title = document.getElementById("modalTitle");
    title.innerHTML = document.getElementById("tooltipTitle").innerHTML;
    let i = 0;
    while (i < labels.length) {
        let fieldLabel = document.createElement("label");
        let field = document.createElement("input");
        field.type = 'text';
        field.id = labels[i];
        field.name = labels[i];
        field.value = labels[i+1];
        fieldLabel.htmlFor = labels[i];
        fieldLabel.innerHTML = labels[i] + ":    ";
        phonyDiv.appendChild(fieldLabel);
        phonyDiv.appendChild(field);
        phonyDiv.appendChild(document.createElement("br"));
        phonyDiv.appendChild(document.createElement("br"));
        i = i+2;
    }
    let hiddenKey = document.createElement("p");
    hiddenKey.innerHTML = String(key);
    hiddenKey.id = "hiddenKey";
    hiddenKey.style.visibility = "hidden";
    phonyDiv.appendChild(hiddenKey);
    modal.style.display = 'block';
    modal.scrollIntoView(true);
}

async function confirm() {
  let modalCnf = document.querySelector('.confirmation');
  modalCnf.style.display = 'block';
}

async function saveElement() {
    let keyEl = document.getElementById("hiddenKey");
    let key = keyEl.innerHTML;
    let url = base + "&type=saveElement&key=" + key
    let fields = contentDiv.getElementsByTagName("input");
    let updated = String(url);
    for (let i = 0; i < fields.length; i++) {
        updated += "&" + fields[i].name + "=" + fields[i].value;
    }
    let response = await fetch(updated);
    let result = await response.text();
    if (String(result) != "") {
        alert(String(result));
    }
    modal.style.display = 'none';
    phonyDiv.textContent = '';
    setTimeout(refreshPage(), 2000);
}

async function deleteElement() {
    let keyEl = document.getElementById("hiddenKey");
    let key = keyEl.innerHTML;
    let url = base + "&type=deleteElement&key=" + key
    let response = await fetch(url);
    let result = await response.text();
    if (String(result) != "") {
        alert(String(result));
    }
    modal.style.display = 'none';
    phonyDiv.textContent = '';
    setTimeout(refreshPage(), 2000);
}


async function refreshPage() {
    window.parent.location = document.referrer;
}


var element = document.getElementById("dashboard");
var modalDiv = document.createElement("div");
modalDiv.className = "modal";
var contentDiv = document.createElement("div");
contentDiv.className = "modal-content";
var title = document.createElement("h4");
title.id = 'modalTitle';
//placeholder title
var text = document.createTextNode("Modal window");
title.appendChild(text);
var hr = document.createElement("hr");
var phonyDiv = document.createElement("div");


var closeBtn = document.createElement("button");
closeBtn.className = "close-img";
var closeImg = document.createElement("img");
closeImg.src = 'https://raw.githubusercontent.com/Tomoms/pssi/master/progetto/close.png';
closeImg.style.height = '30px';
closeImg.style.width = '30px';
closeBtn.appendChild(closeImg);
closeBtn.onclick = function() {
    modal.style.display = 'none';
    phonyDiv.textContent = '';
};

var saveBtn = document.createElement("button");
saveBtn.className = "save-img";
var saveImg = document.createElement("img");
saveImg.src = 'https://raw.githubusercontent.com/Tomoms/pssi/master/progetto/save.png';
saveImg.style.height = '30px';
saveImg.style.width = '30px';
saveBtn.appendChild(saveImg);
saveBtn.onclick = saveElement;

var deleteBtn = document.createElement("button");
deleteBtn.className = "save-img";
var deleteImg = document.createElement("img");
deleteImg.src = 'https://raw.githubusercontent.com/Tomoms/pssi/master/progetto/delete.png';
deleteImg.style.height = '30px';
deleteImg.style.width = '30px';
deleteBtn.appendChild(deleteImg);
deleteBtn.onclick = confirm;


contentDiv.appendChild(title);
contentDiv.appendChild(hr);
contentDiv.appendChild(phonyDiv);
contentDiv.appendChild(closeBtn);
contentDiv.appendChild(saveBtn);
contentDiv.appendChild(deleteBtn);
modalDiv.appendChild(contentDiv);
element.appendChild(modalDiv);

var confDiv = document.createElement("div");
confDiv.className = "confirmation";
var confContDiv = document.createElement("div");
confContDiv.className = "confirmation-content";
var confTitle = document.createElement("h4");
var question = document.createTextNode("Are you sure?");
confTitle.appendChild(question);

var yesBtn = document.createElement("button");
yesBtn.className = "save-img";
var yesImg = document.createElement("img");
yesImg.src = 'https://raw.githubusercontent.com/Tomoms/pssi/master/progetto/ok.png';
yesImg.style.height = '30px';
yesImg.style.width = '30px';
yesBtn.appendChild(yesImg);
yesBtn.onclick = deleteElement;

var noBtn = document.createElement("button");
noBtn.className = "save-img";
var noImg = document.createElement("img");
noImg.src = 'https://raw.githubusercontent.com/Tomoms/pssi/master/progetto/close.png';
noImg.style.height = '30px';
noImg.style.width = '30px';
noBtn.appendChild(noImg);
noBtn.onclick = function() {
    modalCnf.style.display = 'none';
};

confContDiv.appendChild(confTitle);
confContDiv.appendChild(yesBtn);
confContDiv.appendChild(noBtn);
confDiv.appendChild(confContDiv);
element.appendChild(confDiv);

let modalCnf = document.querySelector('.confirmation');
setTimeout(updateEditButtons, 1000);
var modal = document.querySelector('.modal');
