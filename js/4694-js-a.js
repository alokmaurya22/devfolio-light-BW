Shery.textAnimate(".text-target" /* Element to target.*/ , {
    //Parameters are optional.
    style: 2,
    y: 25,
    delay: 2,
    duration: 2,
    ease: "cubic-bezier(1.23, 1, 3.320, 1)",
    multiplier: 0.1,
});
Shery.mouseFollower({
    //Parameters are optional.
    skew: false,
    ease: "cubic-bezier(0.23, 1, 0.320, 1)",
    duration: 0.6,
});