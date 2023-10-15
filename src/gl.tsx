import SwissGL from "./swissgl.js";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const glsl = SwissGL(canvas);
const glslify = (x: any) => x[0];
const FP = glslify`

#define H 2.0 


vec2 cam = vec2(camera.x, -camera.y);
float aspect = resolution.x / resolution.y;
if(aspect < 1.0){
    cam.x *= aspect;
} else {
    cam.y /= aspect;

};

vec2 dataRegionSize = vec2(dataSize * tileSize);
vec2 offset = (dataRegionSize - resolution);
vec2 uv = UV + ((cam) /resolution) ;
uv -= .5;



vec2 uIso =  uv * mat2(1./H,-1.,1./H,1.); // isometric coordinates

float rand = fract(sin(dot(floor(uv * resolution)/resolution, vec2(12.9898,78.233))) * 43758.5453);
uIso.x += rand * 0.005;
uIso.y += rand * 0.005;

vec2 tileCount = resolution / tileSize;
// vec2 uvStep = mod(uv  * tileCount.x, 1.0);
vec2 gridPos = floor(uIso * tileCount.x );

float screenDataRatio =resolution.x / ( (dataSize)* tileSize);

// gridPos += vec2(tileSize/resolution);
ivec2 gridPosI = ivec2(gridPos.x, dataSize-gridPos.y);
gridPosI.x += int(dataSize/2.);
gridPosI.y -= int(dataSize/2.);
float grayValue = data(gridPosI).r;
vec3 green = vec3(170./255.,209./255.,120./255.);
FOut = vec4(vec3(green *  (1.0- grayValue)),0.5);
`;

function render(camera: Vector2, tileSize: number, data: Float32Array) {
  let dataSize = Math.sqrt(data.length);
  //   console.log(dataSize);
  let dataGL = glsl(
    {},
    {
      size: [dataSize, dataSize],
      format: "r32f",
      data: data,
      tag: "grid",
      filter: "nearest",
      wrap: "repeat",
    }
  );
  //   glsl({ F: dataGL, FP: `F(I/20).x*3.0` });

  glsl({
    data: dataGL,
    camera: [camera.x, camera.y],
    resolution: [canvas.width, canvas.height],
    tileSize,
    dataSize,
    // Fragment shader returns 'RGBA'
    FP,
    Aspect: "cover",
    //   Blend: "d*(1-sa)+s*sa",
  });
}
// requestAnimationFrame(render);

export default render;
