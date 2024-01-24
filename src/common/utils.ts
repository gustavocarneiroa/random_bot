function percentage() {
    const sides = 100;
    return Math.floor(Math.random() * sides) + 1;
}

function shuffleArray<T = any>(array: Array<T>) {
    const newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getRandomIndex(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getResponse(message: string) {
    console.log(message)
    const hasOr = message.split(" ").includes("ou");
    if (hasOr) {
        const regex = /^(?:!eai(?: bot)? )?(.*?)(?: ou )(.*?)(?:\?)?$/;
        const [positive, negative] = message.match(regex)?.slice(1) ?? [];

        return {
            positive,
            negative
        }
    }

    return {
        positive: "sim",
        negative: "não"
    }
}

export {
    percentage,
    shuffleArray,
    getResponse,
    getRandomIndex,
}