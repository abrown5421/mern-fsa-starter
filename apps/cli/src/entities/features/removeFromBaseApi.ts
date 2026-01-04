import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

export async function removeFromBaseApi(featureName: string, webSrc: string) {
  const baseApiFile = path.join(webSrc, "app", "store", "api", "baseApi.ts");

  if (!fs.existsSync(baseApiFile)) {
    throw new Error(`baseApi.ts not found at ${baseApiFile}`);
  }

  let content = fs.readFileSync(baseApiFile, "utf-8");

  if (!content.includes(`"${featureName}"`) && !content.includes(`'${featureName}'`)) {
    console.log(`Tag type '${featureName}' not found in baseApi.ts`);
    return;
  }

  const tagTypesRegex = /tagTypes:\s*\[([\s\S]*?)\]/;
  const match = content.match(tagTypesRegex);

  if (!match) {
    throw new Error("Could not find tagTypes array in baseApi.ts");
  }

  const existingTags = match[1];
  
  const tagMatches = existingTags.matchAll(/["']([^"']+)["']/g);
  const tags = Array.from(tagMatches).map((m) => m[1]);
  
  const filteredTags = tags.filter((tag) => tag !== featureName);

  if (filteredTags.length === tags.length) {
    console.log(`Tag type '${featureName}' not found in baseApi.ts`);
    return;
  }

  const newTagsContent = filteredTags.map((tag) => `"${tag}"`).join(", ");
  const replacement = `tagTypes: [${newTagsContent}]`;

  content = content.replace(tagTypesRegex, replacement);

  const formatted = await prettier.format(content, {
    parser: "typescript",
  });

  fs.writeFileSync(baseApiFile, formatted);
  console.log(`✓ Removed '${featureName}' from tagTypes in baseApi.ts`);
}