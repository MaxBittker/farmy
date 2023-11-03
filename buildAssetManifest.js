import { readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dirPath = join(__dirname, "public", "Animals", "Horse");
const states = readdirSync(dirPath);

let imports = "";
let objectEntries = "";

states.forEach((state) => {
  const statePath = join(dirPath, state);

  const files = readdirSync(statePath);
  let stateObjectEntries = "";

  files.forEach((file, index) => {
    const varName = `${state}_horse${index + 1}`;
    const filePath = `/Animals/Horse/${state}/${file}`;
    imports += `import ${varName} from '${filePath}';\n`;
    stateObjectEntries += `'${file}': ${varName},\n`;
  });
  objectEntries += `'${state}': {\n${stateObjectEntries}},\n`;
});

let categories = {};

const dirPath2 = join(__dirname, "public", "Natural");
const natureFiles = readdirSync(dirPath2);
// console.log(natureFiles);
natureFiles.forEach((file) => {
  // let categoryObjectEntries = "";
  // Object.entries(files).forEach(([file, varName]) => {
  //   categoryObjectEntries += `'${file}': ${varName},\n`;
  // });
  //     // extract category from filename
  // console.log(file);
  const categoryName = file.replace(/\d+\.png$/, "");

  // console.log(categoryName);
  let varName = file.replace(/\.png$/, "");
  varName = varName.replace(/ /g, "_");
  if (!categories[categoryName]) categories[categoryName] = {};
  categories[categoryName][file] = varName;
  let filePath = `/Natural/${file}`;
  imports += `import ${varName} from '${filePath}';\n`;
});

let categoryEntries = "";
let plainCategoryEntry = "";
Object.entries(categories).forEach(([categoryName, files]) => {
  let categoryObjectEntries = "";
  let plainCategoryObjectEntries = "";
  Object.entries(files).forEach(([file, varName]) => {
    categoryObjectEntries += `'${file}': ${varName},\n`;
    plainCategoryObjectEntries += `'${file}': '/Natural/${file}',\n`;
  });
  categoryEntries += `'${categoryName}': {\n${categoryObjectEntries}},\n`;
  plainCategoryEntry += `'${categoryName}': {\n${plainCategoryObjectEntries}},\n`;
});

const output = `${imports}\nexport let horseFrames = {\n${objectEntries}};\nexport let natureFrames = {\n${categoryEntries}};`;
const formattedOutput = await prettier.format(output, {
  semi: false,
  parser: "babel",
});

let serverOutput = `export let natureFrames = {\n${plainCategoryEntry}};`;
const formattedServerOutput = await prettier.format(serverOutput, {
  semi: false,
  parser: "babel",
});

writeFileSync(join(__dirname, "src", "allFrames.ts"), formattedOutput);
writeFileSync(
  join(__dirname, "party", "assetFrames.ts"),
  formattedServerOutput
);
