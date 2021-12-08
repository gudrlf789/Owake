const userId = document.querySelector("#channelJoin-userId");
const userPassword = document.querySelector("#channelJoin-userPassword");
const channelName = document.querySelector("#channelJoin-channelName");
const channelPassword = document.querySelector("#channelJoin-channelPassword");
const channelJoinBtn = document.querySelector("#channelJoin-btn");

let channelData;

function channelCheck() {
    //파이어베이스 DB 리스트 불러오기
    axios.get("/list").then((res) => {
        channelData = res.data;

        for (data of channelData.channelList) {
            if (
                channelName.value == data.channelName &&
                channelPassword == channelPassword.value
            ) {
                console.log("success");
            } else {
                console.log("다시 입력");
                location.href = "/channel";
            }
        }
    });
}

channelJoinBtn.addEventListener("click", () => {
    channelCheck();
});
