export const speechTextBox = () => {
    let speechTranslateBtn = document.querySelector("#speechTranslateBtn");
    let btnActivate = false;

    speechTranslateBtn.addEventListener("click", () => {
        btnActivate = !btnActivate;
        btnActivate ? speechTextBoxEnable() : speechTextBoxDisable();
    });
};

function browserCheck() {
    const agent = window.navigator.userAgent.toLowerCase();

    if (
        (agent.indexOf("chrome") > -1 && !!window.chrome) ||
        agent.indexOf("edg/") > -1 ||
        agent.indexOf("edge") > -1 ||
        agent.indexOf("safari") > -1
    ) {
        return true;
    } else {
        return false;
    }
}

function speechTextBoxEnable() {
    if (browserCheck()) {
        let subtitle = receiveText();

        let videoContainers;
        let videoLoading = setInterval(() => {
            videoContainers = document.querySelectorAll(".player");
            if (videoContainers.length !== 0) {
                clearInterval(videoLoading);

                for (let i = 0; i < videoContainers.length; i++) {
                    videoContainers[i].insertAdjacentHTML(
                        "beforeend",
                        subtitle
                    );
                }

                handleSpeechRecognition();
            }
            console.log(videoContainers);
        }, 1000);
    } else {
        return alert(
            "This browser is not supported. Please use chrome, edge, and safari."
        );
    }
}

function speechTextBoxDisable() {
    let speechTextBox = document.querySelectorAll("#speechTextBox");
    speechTextBox.forEach((box) => {
        box.remove();
    });
}

function receiveText(text) {
    let peerId = sessionStorage.getItem("uid");
    let textBoxElement = `
        <div id="speechTextBox" class="card card-${peerId}">
            <div class="card-body">
                <p class="subtitle">${text === undefined ? "" : text}</p>
                <div class="speech__micBtn">
                    <i class="fas fa-microphone-alt"></i>
                </div>
            </div>
        </div>
    `;

    return textBoxElement;
}

function handleSpeechRecognition() {
    let micOnOff = false;
    let micBtn = document.querySelector(".speech__micBtn");
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

    const recognition = new window.SpeechRecognition();
    const kr = "ko-KR";
    const jp = "ja-JP";

    let subtitleText = document.querySelector(".subtitle");
    let cardBody = document.querySelector(".card-body");
    let text;

    recognition.continuous = true;
    recognition.interimResults = true;
    // recognition.lang = 'ja-JP'
    // recognition.lang = 'en-US'
    recognition.lang = kr;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("result", (e) => {
        text = Array.from(e.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");
        console.log(subtitleText);

        subtitleText.innerText = text;
        cardBody.scrollTop = cardBody.scrollHeight;
    });

    recognition.addEventListener("end", () => {
        console.log("recognition End Event!");
        recognition.stop();
    });

    function speechEnable(elem) {
        elem.style.setProperty("color", "red");
        console.log("recognition On Event!");
        recognition.start();
    }

    function speechDisable(elem) {
        elem.style.setProperty("color", "black");
        console.log("recognition OFF Event!");
        recognition.stop();
    }

    recognition.onerror = function (event) {
        console.log(`Speech recognition error detected: ${event.error}`);
        console.log(`Additional information: ${event.message}`);
    };
}
