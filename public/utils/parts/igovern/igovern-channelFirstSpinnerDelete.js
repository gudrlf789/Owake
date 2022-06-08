export const channelFirstSpinnerDeleteFunc = () => {

  const data = {};

  axios.post("/channel/channelFirstSpinnerDelete", data).then((res) => {
    if (res.data.success) {}
  });
}