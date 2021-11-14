// 개발중....
const iframeSettings = () => {
    let iframeSelect = document.getElementsByTagName("iframe")[0];
    let innerDoc =
        iframeSelect.contentDocument || iframe.contentWindow.document;

    innerDoc.head.innerHTML = `
        <style>
        #iframe_inner_container {
            display : inline-block;
            width : 100%;
            height : 100%;
            background-color : #D9A743;
        }
        </style>
        `;
    innerDoc.body.innerHTML = `<div id="iframe_inner_container"><p>Moment Share Display</p></div>`;
};

module.exports = iframeSettings;
