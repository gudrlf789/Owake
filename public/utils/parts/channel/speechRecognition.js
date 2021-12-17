export const speechRecognition = () => {
    const socket = io();

    const chatMsg = document.querySelector("#chat_message");
    const speechBtn = document.getElementById("speechRecognition");

    const select_dialect = document.getElementById("select_dialect");
    const select_language = document.getElementById("select_language");

    // If you modify this array, also update default language / dialect below.
    const langs = [
        ["Afrikaans", ["af-ZA"]],
        ["አማርኛ", ["am-ET"]],
        ["Azərbaycanca", ["az-AZ"]],
        ["বাংলা", ["bn-BD", "বাংলাদেশ"], ["bn-IN", "ভারত"]],
        ["Bahasa Indonesia", ["id-ID"]],
        ["Bahasa Melayu", ["ms-MY"]],
        ["Català", ["ca-ES"]],
        ["Čeština", ["cs-CZ"]],
        ["Dansk", ["da-DK"]],
        ["Deutsch", ["de-DE"]],
        [
            "English",
            ["en-AU", "Australia"],
            ["en-CA", "Canada"],
            ["en-IN", "India"],
            ["en-KE", "Kenya"],
            ["en-TZ", "Tanzania"],
            ["en-GH", "Ghana"],
            ["en-NZ", "New Zealand"],
            ["en-NG", "Nigeria"],
            ["en-ZA", "South Africa"],
            ["en-PH", "Philippines"],
            ["en-GB", "United Kingdom"],
            ["en-US", "United States"],
        ],
        [
            "Español",
            ["es-AR", "Argentina"],
            ["es-BO", "Bolivia"],
            ["es-CL", "Chile"],
            ["es-CO", "Colombia"],
            ["es-CR", "Costa Rica"],
            ["es-EC", "Ecuador"],
            ["es-SV", "El Salvador"],
            ["es-ES", "España"],
            ["es-US", "Estados Unidos"],
            ["es-GT", "Guatemala"],
            ["es-HN", "Honduras"],
            ["es-MX", "México"],
            ["es-NI", "Nicaragua"],
            ["es-PA", "Panamá"],
            ["es-PY", "Paraguay"],
            ["es-PE", "Perú"],
            ["es-PR", "Puerto Rico"],
            ["es-DO", "República Dominicana"],
            ["es-UY", "Uruguay"],
            ["es-VE", "Venezuela"],
        ],
        ["Euskara", ["eu-ES"]],
        ["Filipino", ["fil-PH"]],
        ["Français", ["fr-FR"]],
        ["Basa Jawa", ["jv-ID"]],
        ["Galego", ["gl-ES"]],
        ["ગુજરાતી", ["gu-IN"]],
        ["Hrvatski", ["hr-HR"]],
        ["IsiZulu", ["zu-ZA"]],
        ["Íslenska", ["is-IS"]],
        ["Italiano", ["it-IT", "Italia"], ["it-CH", "Svizzera"]],
        ["ಕನ್ನಡ", ["kn-IN"]],
        ["ភាសាខ្មែរ", ["km-KH"]],
        ["Latviešu", ["lv-LV"]],
        ["Lietuvių", ["lt-LT"]],
        ["മലയാളം", ["ml-IN"]],
        ["मराठी", ["mr-IN"]],
        ["Magyar", ["hu-HU"]],
        ["ລາວ", ["lo-LA"]],
        ["Nederlands", ["nl-NL"]],
        ["नेपाली भाषा", ["ne-NP"]],
        ["Norsk bokmål", ["nb-NO"]],
        ["Polski", ["pl-PL"]],
        ["Português", ["pt-BR", "Brasil"], ["pt-PT", "Portugal"]],
        ["Română", ["ro-RO"]],
        ["සිංහල", ["si-LK"]],
        ["Slovenščina", ["sl-SI"]],
        ["Basa Sunda", ["su-ID"]],
        ["Slovenčina", ["sk-SK"]],
        ["Suomi", ["fi-FI"]],
        ["Svenska", ["sv-SE"]],
        ["Kiswahili", ["sw-TZ", "Tanzania"], ["sw-KE", "Kenya"]],
        ["ქართული", ["ka-GE"]],
        ["Հայերեն", ["hy-AM"]],
        [
            "தமிழ்",
            ["ta-IN", "இந்தியா"],
            ["ta-SG", "சிங்கப்பூர்"],
            ["ta-LK", "இலங்கை"],
            ["ta-MY", "மலேசியா"],
        ],
        ["తెలుగు", ["te-IN"]],
        ["Tiếng Việt", ["vi-VN"]],
        ["Türkçe", ["tr-TR"]],
        ["اُردُو", ["ur-PK", "پاکستان"], ["ur-IN", "بھارت"]],
        ["Ελληνικά", ["el-GR"]],
        ["български", ["bg-BG"]],
        ["Pусский", ["ru-RU"]],
        ["Српски", ["sr-RS"]],
        ["Українська", ["uk-UA"]],
        ["한국어", ["ko-KR"]],
        [
            "中文",
            ["cmn-Hans-CN", "普通话 (中国大陆)"],
            ["cmn-Hans-HK", "普通话 (香港)"],
            ["cmn-Hant-TW", "中文 (台灣)"],
            ["yue-Hant-HK", "粵語 (香港)"],
        ],
        ["日本語", ["ja-JP"]],
        ["हिन्दी", ["hi-IN"]],
        ["ภาษาไทย", ["th-TH"]],
    ];

    for (var i = 0; i < langs.length; i++) {
        select_language.options[i] = new Option(langs[i][0], i);
    }
    // Set default language / dialect.
    select_language.selectedIndex = 10;
    updateCountry();
    select_dialect.selectedIndex = 11;

    function updateCountry() {
        for (let i = select_dialect.options.length - 1; i >= 0; i--) {
            select_dialect.remove(i);
        }
        let list = langs[select_language.selectedIndex];
        for (let i = 1; i < list.length; i++) {
            select_dialect.options.add(new Option(list[i][1], list[i][0]));
        }
        select_dialect.style.visibility =
            list[1].length == 1 ? "hidden" : "visible";
    }

    let content = "";
    let speechRecognitionIsOn = false;

    let speechRecognition = window.webkitSpeechRecognition;
    // creates an instance of speechRecognition
    let recognition = new speechRecognition();
    // captures single result each time
    recognition.continuous = false;

    speechBtn.addEventListener("click", () => {
        if (!speechRecognitionIsOn) {
            speechRecognitionIsOn = true;
            console.log("voice recognition started");
            recognition.lang = select_dialect.value;
            console.log(recognition.lang);
            speechBtn.style.color = "red";
            recognition.start();
        } else {
            speechRecognitionIsOn = false;
            speechBtn.style.color = "";
            console.log("voice recognition stoped");
            recognition.stop();
        }
    });

    recognition.onstart = () => {
        // clears content (optional)
        if (content.length) {
            content = "";
        }
    };
    recognition.onend = () => {
        if (speechRecognitionIsOn) {
            recognition.start();
        }
    };
    recognition.onerror = (event) => {
        // failed to recognize speech
        console.log("Speech recognition error detected: " + event.error);
    };
    recognition.onresult = (event) => {
        let current = event.resultIndex;
        let transcript = event.results[current][0].transcript;
        content += transcript;
        console.log(content);
        chatMsg.value = content;
        console.log("options channel", options.channel);
        socket.emit("speech message", chatMsg.value, options.channel);
        chatMsg.value = "";
    };
};
