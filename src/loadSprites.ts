import { horseFrames, natureFrames } from "./allFrames"

let units: { [key: string]: { [key: string]: HTMLImageElement[] } } = {};
let unit = "horse"
for (const [mode, frames] of Object.entries(horseFrames)) {
    Object.values(frames).forEach(src => {
        let img = new Image();
        img.src = src;
        img.onload = function () {
            let { width, height } = (this as HTMLImageElement);
            img.width = width;
            img.height = height;
        };

        if (!units[unit]) {
            units[unit] = {};
        }
        if (!units[unit][mode]) {
            units[unit][mode] = [];
        }
        units[unit][mode].push(img);
    })
}


// console.log(horseFrames);
interface AssetInfo {
    img: HTMLImageElement;
    src: string;
    width?: number;
    height?: number;
}
let images: Map<string, AssetInfo> = new Map();

// console.log(natureFrames);
Object.values(natureFrames["Tree"]).forEach(src => {
    // console.log(src);
    let img = new Image();
    img.src = src;
    img.onload = function () {
        let { width, height } = (this as HTMLImageElement);
        img.width = width;
        img.height = height;
        // console.dir(img)
    };

    images.set(src, { img, src });
})

// console.log(images);


export { images, units }