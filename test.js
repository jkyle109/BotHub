function genRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(genRand(1, 25));