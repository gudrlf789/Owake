/**
 * @author 전형동
 * @date 2022 03 22
 * @description
 * Socket 초기화 함수
 * 여기서 Socket이 초기화될 때 어디서 어떤 소켓이 생성되는지 로그를 출력해야 함.
 * @returns sockets
 */

export const socketInitFunc = () => {
    const socket = io.connect("/");
    return socket;
};
