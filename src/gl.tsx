import SwissGL from "./swissgl.js";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const glsl = SwissGL(canvas);

function render(camera: Vector2, data: Float32Array) {
  let dataGL = glsl(
    {},
    {
      size: [
        Math.round(Math.sqrt(data.length)),
        Math.round(Math.sqrt(data.length)),
      ],
      format: "r32f",
      data: data,
      tag: "grid",
      filter: "nearest",
      wrap: "repeat",
    }
  );
  glsl({
    data: dataGL,
    camera: [camera.x, camera.y],
    resolution: [canvas.width, canvas.height],
    // Fragment shader returns 'RGBA'
    FP: `
    vec2 cam = vec2(camera.x, -camera.y);
    float aspect = resolution.x / resolution.y;
    if(aspect < 1.0){
        cam.x *= aspect;
    } else {
        cam.y /= aspect;

    };
    vec2 uv = UV + ((cam) /resolution) ;
    //pseudorandom value:
    float rand = fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
    uv.x += rand * 0.001;
    uv.y += rand * 0.001;
    vec2 tileCount = resolution / 35.0;
    vec2 uvStep = mod(uv  * tileCount.x, 1.0);
    vec2 gridPos = floor(uv * tileCount.x);

    float screenDataRatio =( 2000.0* 35.0) / resolution.x;
    float grayValue = data(gridPos / screenDataRatio).r;
    FOut = vec4(.5, grayValue*10.,0.5,0.5);
    `,
    Aspect: "cover",
    //   Blend: "d*(1-sa)+s*sa",
  });
}
// requestAnimationFrame(render);

export default render;
