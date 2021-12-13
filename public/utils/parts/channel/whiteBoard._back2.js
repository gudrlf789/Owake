export const whiteBoardFunc = () => {
    // Container Publising...
    const whiteBoardContainer = document.createElement("div");
    const whiteBoardOptionsContainer = document.createElement("div");

    const canvas = document.createElement("canvas");

    const colorInput = document.createElement("input");
    const numberInput = document.createElement("input");
    const clearBtn = document.createElement("input");

    colorInput.type = "color";
    numberInput.type = "number";
    clearBtn.type = "button";
    clearBtn.style.width = "70px";

    colorInput.id = "colorInput";
    numberInput.id = "numberInput";

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
        whiteBoardBtn.style.color = "#000";
        boardDrawStart();
    }
    function whiteBoardDisable() {
        whiteBoardContainer.hidden = true;
        whiteBoardBtn.style.color = "#fff";
        whiteBoardContainer.remove();
    }
    // Container Publising End

    function boardDrawStart() {
        let socket = io();
        let selectCanvas = document.getElementById("whiteboard-canvas");
        canvas.width = selectCanvas.offsetWidth;
        canvas.height = selectCanvas.offsetHeight;

        let ctx = canvas.getContext("2d");
        let drawing;

        let current = {
            color: getThing().color_name,
        };

        // Event Lisnter
        colorInput.addEventListener("onchange", getThing);
        numberInput.addEventListener("onchange", getThing);
        clearBtn.addEventListener("click", clearAll);

        canvas.addEventListener("mousedown", startDraw);
        canvas.addEventListener("mouseup", overDraw);
        canvas.addEventListener("mouseout", overDraw);
        canvas.addEventListener("mousemove", onMouseMove);

        //Touch support for mobile devices
        canvas.addEventListener("touchstart", startDraw);
        canvas.addEventListener("touchend", overDraw);
        canvas.addEventListener("touchcancel", overDraw);
        canvas.addEventListener("touchmove", onMouseMove);

        window.addEventListener("resize", onResize, false);
        onResize();

        // Event Lisnter End

        function getThing() {
            let color_name = document.getElementById("colorInput").value;
            let size = document.getElementById("numberInput").value;
            return {
                color_name,
                size,
            };
        }

        function clearAll() {
            canvas.width = canvas.width;
        }

        function onMouseMove(e) {
            if (!drawing) {
                return;
            }
            draw(
                e,
                current.x,
                current.y,
                e.clientX || e.touches[0].clientX,
                e.clientY || e.touches[0].clientY,
                current.color
            );
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        }

        function draw(e, x0, y0, x1, y1, color) {
            if (drawing == false) return;
            let editor = getThing();
            ctx.strokeStyle = editor.color_name;
            ctx.lineWidth = editor.size;
            ctx.lineCap = "round";

            if (e.type.includes("mouse")) {
                let mousePos = getMousePos(canvas, e);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.moveTo(mousePos.x, mousePos.y);
            } else {
                let touchPos = getTouchPos(canvas, e);
                ctx.lineTo(touchPos.x, touchPos.y);
                ctx.moveTo(touchPos.x, touchPos.y);
            }
            ctx.stroke();

            let w = canvas.offsetWidth;
            let h = canvas.offsetHeight;

            socket.emit("drawing", {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color: color,
            });
        }

        function startDraw(e) {
            drawing = true;
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
            ctx.beginPath();

            draw(
                e,
                current.x,
                current.y,
                e.clientX || e.touches[0].clientX,
                e.clientY || e.touches[0].clientY,
                current.color
            );
        }

        function overDraw() {
            drawing = false;
        }

        function getMousePos(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top,
            };
        }

        function getTouchPos(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: evt.touches[0].clientX - rect.left,
                y: evt.touches[0].clientY - rect.top,
            };
        }

        function onDrawingEvent(data) {
            console.log(data);
            let w = selectCanvas.offsetWidth;
            let h = selectCanvas.offsetHeight;
            console.log(
                "onDrawingEvent " + data.x0 * w,
                data.y0 * h,
                data.x1 * w,
                data.y1 * h,
                data.color
            );
            draw(
                null,
                data.x0 * w,
                data.y0 * h,
                data.x1 * w,
                data.y1 * h,
                data.color
            );
        }

        socket.on("drawing", onDrawingEvent);

        // make the canvas fill its parent
        function onResize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }
};
