let canvas = document.getElementById("canvas2") as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;
// ctx.imageSmoothingEnabled = false;
import { getState } from "./state";
import { sendEntityUpdate } from "./client";
import { images, units } from "./loadSprites";
import { AgentLayout, EntityLayout } from "./types";
import { v4 as uuidv4 } from "uuid";

let imgValues = [...images.keys()];



// let entities = new Map<string, EntityLayout>();

function makeTree(pos: Matter.Vector) {
    let spriteId = imgValues[Math.floor(Math.random() * imgValues.length)];
    let uuid = uuidv4().slice(0, 8);
    // let state = getState();
    let newEnt: EntityLayout = {
        uuid,
        pos: pos,
        spriteId: spriteId,
        width: images.get(spriteId)?.img.width!,
        height: images.get(spriteId)?.img.height!,
    };
    console.log(newEnt);
    sendEntityUpdate(newEnt);
}



// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let frame = 0;
function DrawEntity(entity: EntityLayout) {
    let camera = getState().camera;
    const cameraX = camera.x - canvas.width / 2;
    const cameraY = camera.y - canvas.height / 2;
    let image = images.get(entity.spriteId)!;

    let w = image.img.width!;
    let h = image.img.height!;
    if (w && h) {
        entity.width = w;
        entity.height = h;
    }
    const x = entity.pos.x - cameraX;
    const y = entity.pos.y - cameraY;

    //check if sprite is on screen:
    if (
        x - w / 2 > canvas.width ||
        y - h > canvas.height ||
        x + w < 0 ||
        y + h < 0
    ) {
        return;
    }

    ctx.drawImage(image.img, x - w / 2, y - h);
    ctx.fillStyle = "red";
    // ctx.fillRect(x, y, 2, 2);
}
function drawUnit(agent: AgentLayout) {
    let camera = getState().camera;
    const cameraX = camera.x - canvas.width / 2;
    const cameraY = camera.y - canvas.height / 2;
    let animals = Object.values(units);
    frame++;
    let { pos, heading, animation } = agent;
    let ticksPerFrame = 4;
    animals.forEach((animal, i) => {
        // console.log(animal);
        let angle = heading;
        let flip = angle > 4;
        if (angle > 4) {
            angle = 4 - (angle - 4);
        }
        let frames = [];
        if (animation == "die") {
            frames = animal["Die"]
        } else if (animation == "rot") {
            frames = animal["Rot"]
            ticksPerFrame = 100;
        } else if (animation == "move") {
            frames = animal["Walk"];
        } else {
            frames = animal["Stand"] || animal["Stand Ground"];
            ticksPerFrame = 8;
        }
        let nFrames = frames.length;
        let framePerDir = nFrames / 5;
        let offset = angle * framePerDir;
        frames = frames.slice(offset, offset + framePerDir);

        // console.log(standFrames.length);
        let img = frames[Math.floor(frame / ticksPerFrame) % frames.length];
        // console.lo;
        if (img) {
            let x = pos.x - cameraX;
            let y = pos.y - cameraY;
            if (flip) {
                ctx.translate(x, y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, -img.width / 2, -img.height);
                ctx.resetTransform();
            } else {
                ctx.drawImage(img, x - img.width / 2, y - img.height);
            }
            ctx.fillStyle = "yellow"
            // set font size:
            ctx.font = "35px NeueBit";
            ctx.letterSpacing = "3px";

            if (agent.word) {

                ctx.fillText(agent.word, x - 20, y - img.height);
            }

            ctx.fillStyle = "blue";
            // ctx.fillRect(x, y, 2, 2);
        }
    });
}
// console.log(entities);
let i = 0;
function renderGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let state = getState();
    let { agents, entities, me } = state;
    // let eList = [...entities.values()];
    // eList.sort((a, b) => a.y - b.y);
    i++
    console.log(i);
    if (i % 1000 == 0) {
        makeTree(me.pos)
    }
    let drawable = [...entities, ...agents.map((a) => (a.uuid == me.uuid ? me : a))];
    drawable.sort((a, b) => {
        let aY = a.pos.y;
        let bY = b.pos.y;

        return aY - bY;
    });
    drawable.forEach((drawable) => {
        if (drawable.spriteId) {
            DrawEntity(drawable);
        } else {
            drawUnit(drawable);
        }
    });
}

export { renderGrid }