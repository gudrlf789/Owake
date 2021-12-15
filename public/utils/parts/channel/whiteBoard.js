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
        colorInput.addEventListener("change", getThing);
        numberInput.addEventListener("change", getThing);
        clearBtn.addEventListener("click", clearAll);

        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
        canvas.addEventListener("mouseout", onMouseUp, false);
        canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

        //Touch support for mobile devices
        canvas.addEventListener("touchstart", onMouseDown, false);
        canvas.addEventListener("touchend", onMouseUp, false);
        canvas.addEventListener("touchcancel", onMouseUp, false);
        canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

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

        socket.on("drawing", onDrawingEvent);

        window.addEventListener("resize", onResize, false);
        onResize();

        function drawLine(x0, y0, x1, y1, color, emit) {
            let editor = getThing();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = editor.color_name;
            context.lineWidth = editor.size;
            context.stroke();
            context.closePath();

            if (!emit) {
                return;
            }
            var w = canvas.offsetWidth;
            var h = canvas.offsetHeight;
            
            socket.emit("drawing", {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color: color,
            });
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

        // limit the number of events per second
        function throttle(callback, delay) {
            var previousCall = new Date().getTime();
            return function () {
                var time = new Date().getTime();

                if (time - previousCall >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        }

        function onDrawingEvent(data) {
            const w = selectCanvas.offsetWidth;
            const h = selectCanvas.offsetHeight;
            
            const x0 = data.x0 * w;
            const y0 = data.y0 * h;
            const x1 = data.x1 * w;
            const y1 = data.y1 * h;

            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            //context.strokeStyle = data.color;
            //context.lineWidth = editor.size;
            context.stroke();
            context.closePath();
        }

        // make the canvas fill its parent
        function onResize() {
            canvas.width = selectCanvas.offsetWidth;
            canvas.height = selectCanvas.offsetHeight;
        }
    }
};
