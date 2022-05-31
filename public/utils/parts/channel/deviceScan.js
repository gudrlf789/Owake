export const deviceScan = () => {
    let deviceScan = navigator.userAgent;
    let touchstart = "touchstart";
    let click = "click";

    if (deviceScan.includes("iPhone") || deviceScan.includes("iPad")) {
        console.log("Iphone or Ipad");
        return touchstart;
    } else {
        console.log("Android or Web");
        return click;
    }
};
