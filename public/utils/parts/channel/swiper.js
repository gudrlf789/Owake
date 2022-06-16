export const SwiperFunc = () => {
    let swiper = new Swiper(".optionsSwiper", {
        rewind: true,
        navigation: {
            nextEl: ".nav__right",
            prevEl: ".nav__left",
        },
    });

    return swiper;
};
