export const deviceScan = () => {
    let deviceScan = navigator.userAgent;
    let deviceEvent = deviceScan.match(/iPhone/i || /iPad/i)
        ? "touchstart"
        : "click";

    if (deviceScan.match(/iPhone/i || /iPad/i)) {
        console.log("Iphone or iPad");
    }
    console.log("Android or Web");
    return deviceEvent;
};
