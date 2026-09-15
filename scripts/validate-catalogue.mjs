import { readFile } from "node:fs/promises";
import { parseCatalogue } from "../lib/catalogue-schema.ts";

const filename = process.argv[2] ?? new URL("../data/shanghai.catalogue.json", import.meta.url);
try {
  const catalogue = parseCatalogue(JSON.parse(await readFile(filename, "utf8")));
  const coordinateCount = catalogue.places.filter(p => p.geo.status === "verified").length;
  console.log(`${catalogue.city.name}地点库：${catalogue.places.length}个地点通过校验；${coordinateCount}个已核对坐标，${catalogue.places.length - coordinateCount}个待补坐标。`);
} catch (error) {
  if (error.issues) for (const issue of error.issues) console.error(`${issue.path.join(".")}: ${issue.message}`);
  else console.error(error.message);
  process.exitCode = 1;
}
