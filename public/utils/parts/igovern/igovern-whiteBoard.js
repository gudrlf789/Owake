import { deviceScan } from "./igovern-deviceScan.js";
import { channelName } from "./igovern-sessionStorage.js";
import { checkIsHost } from "./igovern-checkIsHost.js";

let event = deviceScan();

// Container Publising...
const whiteBoardContainer = document.createElement("div");
const whiteBoardOptionsContainer = document.createElement("div");

const canvas = document.createElement("canvas");

const clearBtn = document.createElement("input");
const numberInput = document.createElement("input");
const colorInput = document.createElement("input");

colorInput.type = "color";
numberInput.type = "number";
clearBtn.type = "button";
clearBtn.style.width = "70px";
numberInput.style.width = "50px";

colorInput.id = "colorInput";
colorInput.value = "#f44336";
numberInput.id = "numberInput";
numberInput.value = "1";

whiteBoardOptionsContainer.className = "options-container";
whiteBoardOptionsContainer.id = "whiteBoardOptionsContainer";

clearBtn.id = "clearBtn";
clearBtn.value = "Clear";

const selectLocalVideoContainer = document.querySelector(
    "#local__video__container"
);

const whiteBoardBtn = document.querySelector("#whiteBoard");
const boardImg = document.querySelector("#board-img");

let whiteBoardBtnActive = false;

whiteBoardContainer.className = "whiteBoard";
whiteBoardContainer.id = "whiteBoardContainer";

canvas.id = "whiteboard-canvas";

whiteBoardOptionsContainer.append(colorInput, numberInput, clearBtn);
whiteBoardContainer.appendChild(canvas);
whiteBoardContainer.appendChild(whiteBoardOptionsContainer);

export const whiteBoardFunc = (whiteBoardSocket) => {
    // Click Event Handler
    whiteBoardBtn.addEventListener(event, (e) => {
        handleWhiteboard(e);
    });

    whiteBoardSocket.on("igoven-whiteBoard-client", (whiteBoardBtnActive) => {
        whiteBoardBtnActive ? whiteBoardEnable() : whiteBoardDisable();
    });

    function whiteBoardSocketEvent(whiteBoardBtnActive) {
        whiteBoardBtnActive ? whiteBoardEnable() : whiteBoardDisable();
        whiteBoardSocket.emit("igoven-whiteBoard", channelName, whiteBoardBtnActive);
    };

    function handleWhiteboard(e) {
        whiteBoardBtnActive = !whiteBoardBtnActive;

        if(checkIsHost()){
            whiteBoardSocketEvent(whiteBoardBtnActive);
        }else {
            alert("Host Only");
        }
    }

    function whiteBoardEnable() {
        selectLocalVideoContainer.append(whiteBoardContainer);
        whiteBoardContainer.hidden = false;
        boardDrawStart();

        boardImg.src = "/right/whiteboard_a.svg";
    }
    function whiteBoardDisable() {
        whiteBoardContainer.hidden = true;
        // whiteBoardContainer.remove();

        boardImg.src = "/right/whiteboard.svg";
    }
    // Container Publising End

    function boardDrawStart() {
        let selectCanvas = document.getElementById("whiteboard-canvas");
        let rect = canvas.getBoundingClientRect();

        canvas.width = selectCanvas.offsetWidth;
        canvas.height = selectCanvas.offsetHeight;

        let context = canvas.getContext("2d");

        let current = {
            color: getThing().color_name,
            size: getThing().size,
        };
        let drawing = false;

        // Event Lisnter
        colorInput.addEventListener("change", changeColorOrSize);
        numberInput.addEventListener("change", changeColorOrSize);
        clearBtn.addEventListener("click", clearAll);

        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
        canvas.addEventListener("mouseout", onMouseUp, false);
        canvas.addEventListener("mousemove", onMouseMove, false);

        //Touch support for mobile devices
        canvas.addEventListener("touchstart", onMouseDown, false);
        canvas.addEventListener("touchend", onMouseUp, false);
        canvas.addEventListener("touchcancel", onMouseUp, false);
        canvas.addEventListener("touchmove", onMouseMove, false);

        function getThing() {
            let color_name = document.getElementById("colorInput").value;
            let size = document.getElementById("numberInput").value;

            return {
                color_name,
                size,
            };
        }

        function changeColorOrSize() {
            const { color_name, size } = getThing();

            current.color = color_name;
            current.size = size;
        }

        function clearAll() {
            canvas.width = canvas.width;
        }

        whiteBoardSocket.on("drawing", onDrawingEvent);

        window.addEventListener("resize", onResize, false);

        function drawLine(x0, y0, x1, y1, color, size, emit) {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = size;
            context.lineCap = "round";
            context.stroke();
            context.closePath();

            if (!emit) {
                return;
            }
            var w = canvas.offsetWidth;
            var h = canvas.offsetHeight;

            whiteBoardSocket.emit(
                "drawing",
                {
                    x0: x0 / w,
                    y0: y0 / h,
                    x1: x1 / w,
                    y1: y1 / h,
                    color: color,
                    size: size,
                },
                window.sessionStorage.getItem("channel")
            );
        }

        function checkIphoneMobile() {
            const checkIphone = navigator.userAgent.toLowerCase();

            if (checkIphone.indexOf("iphone") > -1) {
                alert(
                    "We are sorry for that iPhone users can't draw freely on the whiteboard yet."
                );
                return false;
            }
            return true;
        }

        function onMouseDown(e) {
            if (checkIphoneMobile()) {
                drawing = true;
                current.x =
                    e.clientX - rect.left || e.touches[0].clientX - rect.left;
                current.y =
                    e.clientY - rect.top || e.touches[0].clientY - rect.top;
            }
        }

        function onMouseUp(e) {
            if (!drawing) {
                return;
            }
            drawing = false;
            drawLine(
                current.x,
                current.y,
                e.clientX - rect.left || e.touches[0].clientX - rect.left,
                e.clientY - rect.top || e.touches[0].clientY - rect.top,
                current.color,
                current.size,
                true
            );
        }

        function onMouseMove(e) {
            if (!drawing) {
                return;
            }

            drawLine(
                current.x,
                current.y,
                e.clientX - rect.left || e.touches[0].clientX - rect.left,
                e.clientY - rect.top || e.touches[0].clientY - rect.top,
                current.color,
                current.size,
                true
            );
            current.x =
                e.clientX - rect.left || e.touches[0].clientX - rect.left;
            current.y = e.clientY - rect.top || e.touches[0].clientY - rect.top;
        }

        function onDrawingEvent(data) {
            const w = canvas.width;
            const h = canvas.height;
            drawLine(
                data.x0 * w,
                data.y0 * h,
                data.x1 * w,
                data.y1 * h,
                data.color,
                data.size
            );
        }

        // make the canvas fill its parent
        function onResize() {
            canvas.width = selectCanvas.offsetWidth;
            canvas.height = selectCanvas.offsetHeight;
        }
    }
};
