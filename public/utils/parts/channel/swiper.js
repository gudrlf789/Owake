export const SwiperFunc = () => {
    const swiper = new Swiper(".mySwiper", {
        effect: "cards",
        grabCursor: true,
        zoom: true,
    });

    console.log(swiper);
};
