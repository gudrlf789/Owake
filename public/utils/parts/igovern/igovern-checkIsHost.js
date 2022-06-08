export const checkIsHost = () => {
  const isHost = window.sessionStorage.getItem("isHost");

  if(isHost === "Y"){
    return true;
  }
  return false;
}