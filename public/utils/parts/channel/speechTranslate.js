import { browserCheck } from "./browserEvent.js";
import { socketInitFunc } from "./socket.js";

/**
 * @author 전형동
 * @version 1.1
 * @data 2022.08.17
 * @description
 * STT + Translator 제작 완료
 */

let speechSocket = socketInitFunc();
let userId = sessionStorage.getItem("uid");
let channel = sessionStorage.getItem("channel");
let subtitleBoxActivate = false;
let speechActivate = false;
let translateActivate = false;
let micOnOff = false;

export const speechTextBox = () => {
    let speechTranslateBtn = document.querySelector("#speechTranslateBtn");
    let btnActivate = false;

    speechTranslateBtn.addEventListener("click", () => {
        btnActivate = !btnActivate;
        btnActivate ? speechTextBoxEnable() : speechTextBoxDisable();
    });

    if (subtitleBoxActivate) {
        document
            .querySelector(".send-speech-lang")
            .addEventListener("change", getSendValue);
        document
            .querySelector(".receive-speech-lang")
            .addEventListener("change", getReceiveValue);
    }
};

async function speechTextBoxEnable() {
    if (browserCheck()) {
        speechSocket.emit("speech-join", { peer: userId, channel: channel });
        subtitleBoxActivate = true;
        createSpeechTextBox();

        await handleSpeechRecognition();
    } else {
        return alert(
            "This browser is not supported. Please use chrome, edge, and safari."
        );
    }
}

function createSpeechTextBox() {
    let subtitle = receiveText();
    let videoBox = document.querySelector("#local__videoBox");
    videoBox.insertAdjacentHTML("beforeend", subtitle);
    getLangs();
    createSubTitle();
}

function speechTextBoxDisable() {
    subtitleBoxActivate = false;
    let speechTextBox = document.querySelectorAll("#speechTextBox");

    speechTextBox.forEach((box) => {
        box.remove();
    });

    speechSocket.emit("speech-leave", { peer: userId, channel: channel });
}

function receiveText() {
    let textBoxElement = `
        <div id="speechTextBox" class="card card-${userId}">
            <div class="card-body">
            </div>
            <div class="card-options">
                <div class="speech-micBtn">
                    <i class="fas fa-microphone-alt"></i>
                </div>
                <select class="lang send-speech-lang"></select>
                <select class="lang receive-speech-lang"></select>
            </div>
        </div>
        `;
    return textBoxElement;
}

function createSubTitle() {
    let selectCardBody = document.querySelector(".card-body");
    let originalLang = document.createElement("p");
    let translateLang = document.createElement("p");

    originalLang.id = "originalLang";
    translateLang.id = "translateLang";

    originalLang.innerHTML = `Original Speech`;
    translateLang.innerHTML = `Translate Speech`;
    selectCardBody.append(originalLang, translateLang);
}

async function handleSpeechRecognition() {
    let micBtn = document.querySelector(".speech-micBtn");
    micBtn.addEventListener("click", (e) => {
        micOnOff = !micOnOff;
        micOnOff ? speechEnable(e.target) : speechDisable(e.target);
    });

    window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechGrammarList =
        window.SpeechGrammarList || webkitSpeechGrammarList;
    const speechRecognitionEvent =
        window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    const recognition = new SpeechRecognition();

    let cardBody = document.querySelector(".card-body");
    let subTitleText = document.getElementById("originalLang");
    let text;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getSendValue();
    recognition.maxAlternatives = 1;

    recognition.addEventListener("result", (e) => {
        text = Array.from(e.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

        subTitleText.innerText = text;

        if (e.results[0].isFinal) {
            translateAPI(text, translateActivate);
        }
        cardBody.scrollTop = cardBody.scrollHeight;
    });

    recognition.addEventListener("end", () => {
        speechActivate = false;
        micOnOff = false;
        console.log("recognition End Event!");
        recognition.abort();
        let micIcon = document.querySelector(".fa-microphone-alt");
        micIcon.style.setProperty("color", "black");
    });

    function speechEnable(elem) {
        elem.style.setProperty("color", "red");
        console.log("recognition On Event!");

        speechSocket.emit("speech-on", {
            peer: userId,
            channel: channel,
            speechStatus: speechActivate,
        });

        recognition.start();
    }

    function speechDisable(elem) {
        elem.style.setProperty("color", "black");
        console.log("recognition OFF Event!");

        speechSocket.emit("speech-off", {
            peer: userId,
            channel: channel,
            speechStatus: speechActivate,
        });

        recognition.stop();
    }

    recognition.onerror = function (event) {
        console.log(`Speech recognition error detected: ${event.error}`);
        console.log(`Additional information: ${event.message}`);
    };
}

async function getLangs() {
    let res = await fetch(`https://libretranslate.com/languages`);
    let data = await res.json();

    let sendSpeechLang = document.querySelector(".send-speech-lang");
    let receiveSpeechLang = document.querySelector(".receive-speech-lang");

    sendSpeechLang.classList.forEach((name) => {
        if (name === "send-speech-lang") {
            appendData(data, "send");
        }
    });

    receiveSpeechLang.classList.forEach((name) => {
        if (name === "receive-speech-lang") {
            appendData(data, "receive");
        }
    });
}

async function translateAPI(text, active) {
    active = true;
    if (active === true) {
        const res = await fetch(
            "https://translate.argosopentech.com/translate",
            {
                method: "POST",
                body: JSON.stringify({
                    q: text,
                    source: `${getSendValue()}`,
                    target: getReceiveValue(),
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        let data = await res.json();
        console.log(data);

        let subTitleText = document.getElementById("translateLang");
        subTitleText.innerText = data.translatedText;

        speechSocket.emit("speech-send", {
            peer: userId,
            channel: channel,
            original_text: text,
            translate_text: data.translatedText,
        });

        active = false;
    } else {
        active = false;
        console.log("Not Translate!!");
    }
}

function getSendValue() {
    let val = document.querySelector(".send-speech-lang").value;
    localStorage.setItem(`sendLang`, JSON.stringify(val));
    return val;
}

function getReceiveValue() {
    let val = document.querySelector(".receive-speech-lang").value;
    localStorage.setItem(`receiveLang`, JSON.stringify(val));
    return val;
}

function appendData(d, elem) {
    let mainDiv = document.querySelector(`.${elem}-speech-lang`);
    d.forEach((el) => {
        let opt = document.createElement(`option`);
        opt.value = el.code;
        opt.textContent = el.name;
        mainDiv.append(opt);
    });
}

//   Receive Socket Data

speechSocket.on("speech-receive", (params) => {
    let originalLang = document.getElementById("originalLang");
    let translateLang = document.getElementById("translateLang");

    originalLang.innerHTML = params.original_text;
    translateLang.innerHTML = params.translate_text;
});
