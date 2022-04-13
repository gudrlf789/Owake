let socket;
let text = {
    text: "",
};
let channel = window.sessionStorage.getItem("channel");

const textShare = document.querySelector("#textShare");
const localContainer = document.querySelector("#local__video__container");

const textContainer = document.createElement("section");
const textArea = document.createElement("textarea");
textContainer.className = "textContainer";
textContainer.id = "textContainer";
textArea.id = "text";

export const shareEditerFunc = () => {
    handlerEditerAction();

    window.attachEvent
        ? window.attachEvent("onload", scriptElementFunc)
        : window.addEventListener("load", scriptElementFunc, false);
};

function handlerEditerAction() {
    socket = io.connect("/");
    let editerActivate = false;
    textShare.addEventListener("click", (e) => {
        editerActivate = !editerActivate;
        editerActivate ? editerEnable() : editerDisable();
    });
}

function editerEnable() {
    textContainer.append(textArea);
    localContainer.append(textContainer);
    setup();
    removeLicense();
    socket.emit("join-textShare", channel);
}

function editerDisable() {
    localContainer.removeChild(textContainer);
    socket.emit("leave-textShare", channel);
}

function scriptElementFunc() {
    styleElementFunc();

    const p5 = document.createElement("script");
    const p5DomMin = document.createElement("script");
    const p5SoundMin = document.createElement("script");
    const jQuery = document.createElement("script");
    const froalaEditor = document.createElement("script");
    const codemirrorMin = document.createElement("script");
    const xmlMin = document.createElement("script");

    p5.async = true;
    p5.src = "p5.min.js";
    p5DomMin.async = true;
    p5DomMin.src = "p5.dom.min.js";
    p5SoundMin.async = true;
    p5SoundMin.src = "p5.sound.min.js";
    jQuery.async = true;
    jQuery.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js";
    froalaEditor.async = true;
    froalaEditor.src =
        "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.8.5/js/froala_editor.pkgd.min.js";
    codemirrorMin.async = true;
    codemirrorMin.src =
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/codemirror.min.js";
    xmlMin.async = true;
    xmlMin.src =
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/mode/xml/xml.min.js";

    const body = document.querySelector("body");

    body.appendChild(p5);
    body.appendChild(p5DomMin);
    body.appendChild(jQuery);
    body.appendChild(froalaEditor);
    body.appendChild(codemirrorMin);
    body.appendChild(xmlMin);
}

function styleElementFunc() {
    const linkCodemirrorMin = document.createElement("link");
    const froalaEditor = document.createElement("link");
    const froalaStyle = document.createElement("link");

    linkCodemirrorMin.rel = "stylesheet";
    froalaEditor.rel = "stylesheet";
    froalaStyle.rel = "stylesheet";

    linkCodemirrorMin.type = "text/css";
    froalaEditor.type = "text/css";
    froalaStyle.type = "text/css";

    linkCodemirrorMin.href =
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.0/codemirror.min.css";
    froalaEditor.href =
        "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.0/css/froala_editor.pkgd.min.css";
    froalaStyle.href =
        "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.0/css/froala_style.min.css";

    const head = document.getElementsByTagName("head")[0];
    head.appendChild(linkCodemirrorMin);
    head.appendChild(froalaEditor);
    head.appendChild(froalaStyle);
}

function setup() {
    $("#text").on("froalaEditor.keyup", function () {
        let html = $(this).froalaEditor("html.get");
        let data = {
            text: html,
        };
        socket.emit("text", channel, data);
    });
    $("#text").froalaEditor({
        toolbarButtons: [
            "fullscreen",
            "bold",
            "italic",
            "underline",
            "strikeThrough",
            "subscript",
            "superscript",
            "|",
            "fontFamily",
            "fontSize",
            "color",
            "inlineStyle",
            "paragraphStyle",
            "|",
            "paragraphFormat",
            "align",
            "formatOL",
            "formatUL",
            "outdent",
            "indent",
            "quote",
            "-",
            "insertLink",
            "insertImage",
            "insertVideo",
            "insertFile",
            "insertTable",
            "|",
            "emoticons",
            "specialCharacters",
            "insertHR",
            "selectAll",
            "clearFormatting",
            "|",
            "print",
            "help",
            "html",
            "|",
            "undo",
            "redo",
        ],
        fullPage: true,
    });

    socket.on("text", handleRecievedText);
    socket.on("newUser", updateText);
}

function updateText(data) {
    text.text = data.text;
    $("#text").froalaEditor("html.set", data.text);
    let editor = $("#text").data("froala.editor");
    editor.selection.setAtEnd(editor.$el.get(0));
    editor.selection.restore();
}

function handleRecievedText(data) {
    text.text = data.text;
    $("#text").froalaEditor("html.set", data.text);
    let editor = $("#text").data("froala.editor");
    editor.selection.setAtEnd(editor.$el.get(0));
    editor.selection.restore();
}

async function removeLicense() {
    const selectDivEl = document.querySelector(".show-placeholder");
    if (selectDivEl.childNodes[0].firstChild) {
        let licenseRemove = await selectDivEl.childNodes[0].firstChild.remove();
        return licenseRemove;
    }
}
