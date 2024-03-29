// FileDelivery Activator Functions
const localVideoContainer = document.querySelector("#local__video__container");
const fileDeliveryBtn = document.querySelector("#fileDeliveryBtn");
const fileDeliveryImg = document.querySelector("#fileDelivery-img");

let deliveryActive = false;

export const fileDelivery = () => {
    fileDeliveryBtn.addEventListener(
        "click",
        (e) => {
            deliveryActive = !deliveryActive;
            deliveryActive ? fileDeliveryEnable() : fileDeliveryDisable();
        },
        false
    );
};

function fileDeliveryEnable() {
    fileDeliveryImg.src = "/left/file_a.svg";
    // openWindowPop();
    openIframeLayer();
}

function fileDeliveryDisable() {
    fileDeliveryImg.src = "/left/file.svg";
    closeIframeLayer();
}

function openIframeLayer() {
    const iframeLayerContainer = document.createElement("section");
    iframeLayerContainer.className = "fileDelivery-layer-container";
    const iframe = document.createElement("iframe");
    iframe.style.setProperty("position", "absolute");
    iframe.style.setProperty("top", "0");
    iframe.style.setProperty("left", "0");
    iframe.style.setProperty("right", "0");
    iframe.style.setProperty("margin", "0 auto");
    iframe.style.setProperty("width", "100%");
    iframe.style.setProperty("height", "100%");

    let url = "https://owakeproxy.ga/api/v1/fileTransfer";
    iframe.src = url;

    iframeLayerContainer.appendChild(iframe);
    localVideoContainer.appendChild(iframeLayerContainer);
}

function closeIframeLayer() {
    const getFileDeliveryLayer = document.querySelector(
        ".fileDelivery-layer-container"
    );
    localVideoContainer.removeChild(getFileDeliveryLayer);
}
