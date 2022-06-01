// FileDelivery Activator Functions
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
    openWindowPop();
}

function openWindowPop() {
    let url = "https://owakeproxy.ga/api/v1/fileTransfer";
    let name = "popup";
    let options =
        "top=10, left=10, width=500, height=600, status=no, menubar=no, toolbar=no, resizable=no location=no";
    window.open(url, name, options);
}

function fileDeliveryDisable() {
    fileDeliveryImg.src = "/left/file.svg";
}
