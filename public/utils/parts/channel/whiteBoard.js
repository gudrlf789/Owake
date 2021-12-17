export const whiteBoardFunc = () => {
    let whiteboardSocket = io();

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
    numberInput.id = "numberInput";

    whiteBoardOptionsContainer.className = "options-container";
    whiteBoardOptionsContainer.id = "whiteBoardOptionsContainer";
    whiteBoardOptionsContainer.style.display = "flex";
    whiteBoardOptionsContainer.style.flexDirection = "row-reverse";

    clearBtn.id = "clearBtn";
    clearBtn.value = "Clear";

    const selectLocalVideoContainer = document.querySelector(
        "#local__video__container"
    );
    const whiteBoardBtn = document.querySelector("#whiteBoard");
    let whiteBoardBtnActive = false;

    whiteBoardContainer.className = "whiteBoard";
    whiteBoardContainer.id = "whiteBoardContainer";

    canvas.id = "whiteboard-canvas";

    whiteBoardOptionsContainer.append(colorInput, numberInput, clearBtn);
    whiteBoardContainer.append(whiteBoardOptionsContainer, canvas);

    whiteBoardBtn.addEventListener("click", () => {
        whiteBoardBtnActive = !whiteBoardBtnActive;
        whiteBoardBtnActive ? whiteBoardEnable() : whiteBoardDisable();
    });

    function whiteBoardEnable() {
        selectLocalVideoContainer.append(whiteBoardContainer);
        whiteBoardContainer.hidden = false;
        whiteBoardBtn.style.color = "rgb(165, 199, 236)";
        boardDrawStart();
    }
    function whiteBoardDisable() {
        whiteBoardContainer.hidden = true;
        whiteBoardBtn.style.color = "#fff";
        whiteBoardContainer.remove();
        whiteboardSocket.emit("leave-whiteboard", window.sessionStorage.getItem("channel"));
    }
    // Container Publising End

    function boardDrawStart() {
        // (임시) 화이트 보드 사용시에 다시 방 입장
        whiteboardSocket.emit("join-whiteboard", window.sessionStorage.getItem("channel"));

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

        whiteboardSocket.on("drawing", onDrawingEvent);

        window.addEventListener("resize", onResize, false);
        onResize();

        function drawLine(x0, y0, x1, y1, color, emit) {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();

            if (!emit) { return; }
            const w = canvas.offsetWidth;;
            const h = canvas.offsetHeight;

            whiteboardSocket.emit("drawing", {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color: color
            }, window.sessionStorage.getItem("channel"));
        }

        function onMouseDown(e) {
            drawing = true;
            current.x = e.clientX - rect.left || e.touches[0].clientX - rect.left;
            current.y = e.clientY - rect.top || e.touches[0].clientY - rect.top;
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
                true
            );
            current.x = e.clientX - rect.left || e.touches[0].clientX - rect.left;
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
                data.color
            );
        }

        // make the canvas fill its parent
        function onResize() {
            canvas.width = selectCanvas.offsetWidth;
            canvas.height = selectCanvas.offsetHeight;
        }
    }
};
