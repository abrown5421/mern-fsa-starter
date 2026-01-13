import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

export async function removeFromServerFile(
  camelName: string,
  pluralCamelName: string,
  apiRoot: string
) {
  const serverFile = path.join(apiRoot, "server.ts");

  if (!fs.existsSync(serverFile)) {
    throw new Error(`server.ts not found at ${serverFile}`);
  }

  let content = fs.readFileSync(serverFile, "utf-8");
  let modified = false;

  const importPattern = new RegExp(
    `import\\s+${camelName}Routes\\s+from\\s+['"]\\.\/routes\/${pluralCamelName}\\.routes['"];?\\s*`,
    "g"
  );
  
  if (importPattern.test(content)) {
    content = content.replace(importPattern, "");
    modified = true;
  }

  const routePattern = new RegExp(
    `app\\.use\\(['"]\/api\/${pluralCamelName}['"],\\s*${camelName}Routes\\);?\\s*`,
    "g"
  );
  
  if (routePattern.test(content)) {
    content = content.replace(routePattern, "");
    modified = true;
  }

  if (!modified) {
    console.log(`ℹ️  No references to '${camelName}' found in server.ts`);
    return;
  }

  content = content.replace(/\n\n\n+/g, "\n\n");

  const formatted = await prettier.format(content, {
    parser: "typescript",
  });

  fs.writeFileSync(serverFile, formatted);
  console.log(` Removed '${camelName}' route from server.ts`);
}