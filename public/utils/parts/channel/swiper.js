export const SwiperFunc = () => {
    let swiper = new Swiper(".mySwiper", {
        pagination: {
            el: ".swiper-pagination",
        },
    });

    return swiper;
};
