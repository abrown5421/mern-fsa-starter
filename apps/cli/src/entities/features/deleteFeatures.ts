import fs from "node:fs";
import path from "node:path";
import { select, confirm } from "@inquirer/prompts";
import { toCamelCase } from "../../shared/case.js";
import { webSrc, repoRoot } from "../../shared/paths.js";
import { removeFromServerFile } from "./removeFromServerFile.js";
import { removeFromBaseApi } from "./removeFromBaseApi.js";

interface FeatureInfo {
  name: string;
  camelName: string;
  pluralCamelName: string;
  hasBackend: boolean;
  hasFrontend: boolean;
  backendPath?: string;
  frontendPath?: string;
  routePath?: string;
}

function getAvailableFeatures(): FeatureInfo[] {
  const features: FeatureInfo[] = [];
  const apiRoot = path.join(repoRoot, "apps/api/src");
  const entitiesDir = path.join(apiRoot, "entities");
  const routesDir = path.join(apiRoot, "routes");
  const frontendApiDir = path.join(webSrc, "app", "store", "api");

  if (fs.existsSync(entitiesDir)) {
    const entities = fs.readdirSync(entitiesDir);
    
    for (const entity of entities) {
      const entityPath = path.join(entitiesDir, entity);
      
      if (!fs.statSync(entityPath).isDirectory() || entity === "user") {
        continue;
      }

      const camelName = entity;
      const pluralCamelName = `${camelName}s`;
      const routePath = path.join(routesDir, `${pluralCamelName}.routes.ts`);
      const frontendPath = path.join(frontendApiDir, `${pluralCamelName}Api.ts`);

      features.push({
        name: camelName.charAt(0).toUpperCase() + camelName.slice(1),
        camelName,
        pluralCamelName,
        hasBackend: true,
        hasFrontend: fs.existsSync(frontendPath),
        backendPath: entityPath,
        routePath: fs.existsSync(routePath) ? routePath : undefined,
        frontendPath: fs.existsSync(frontendPath) ? frontendPath : undefined,
      });
    }
  }

  return features;
}

function deleteFolderRecursive(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

export async function deleteFeature() {
  console.log("\nDelete Feature\n");

  const features = getAvailableFeatures();

  if (features.length === 0) {
    console.log("No features available to delete.");
    console.log("   (The 'user' feature is protected and cannot be deleted)\n");
    return;
  }

  const choices = features.map((f) => ({
    name: `${f.name} ${f.hasBackend ? "Backend" : ""} ${f.hasFrontend ? "Frontend" : ""}`,
    value: f.camelName,
  }));

  const selectedFeature = await select({
    message: "Which feature would you like to delete?",
    choices,
  });

  const feature = features.find((f) => f.camelName === selectedFeature);

  if (!feature) {
    throw new Error("Feature not found");
  }

  console.log("\nWARNING: This action will delete the following:\n");
  
  if (feature.backendPath) {
    console.log(`Backend entity folder: ${feature.backendPath}`);
  }
  if (feature.routePath) {
    console.log(`Route file: ${feature.routePath}`);
  }
  if (feature.frontendPath) {
    console.log(`Frontend API file: ${feature.frontendPath}`);
  }
  
  const typesDir = path.join(webSrc, "types");
  const typeFile = path.join(typesDir, `${feature.camelName}.types.ts`);
  if (fs.existsSync(typeFile)) {
    console.log(`   📄 Type definitions: ${typeFile}`);
  }

  console.log("\n   It will also update:");
  console.log("   - server.ts (remove route import and usage)");
  console.log("   - baseApi.ts (remove tag type)");
  console.log("\n   ALL DATA in the MongoDB collection will be PERMANENTLY DELETED!");

  const confirmDelete = await confirm({
    message: `\nAre you absolutely sure you want to delete the "${feature.name}" feature?`,
    default: false,
  });

  if (!confirmDelete) {
    console.log("\nFeature deletion cancelled.\n");
    return;
  }

  const doubleConfirm = await confirm({
    message: "This cannot be undone. Proceed with deletion?",
    default: false,
  });

  if (!doubleConfirm) {
    console.log("\nFeature deletion cancelled.\n");
    return;
  }

  console.log("\n🗑️  Deleting feature files...\n");

  const apiRoot = path.join(repoRoot, "apps/api/src");
  let deletedCount = 0;

  if (feature.backendPath && fs.existsSync(feature.backendPath)) {
    deleteFolderRecursive(feature.backendPath);
    console.log(`Deleted entity folder: ${feature.backendPath}`);
    deletedCount++;
  }

  if (feature.routePath && fs.existsSync(feature.routePath)) {
    fs.unlinkSync(feature.routePath);
    console.log(`Deleted route file: ${feature.routePath}`);
    deletedCount++;
  }

  if (feature.frontendPath && fs.existsSync(feature.frontendPath)) {
    fs.unlinkSync(feature.frontendPath);
    console.log(`Deleted frontend API file: ${feature.frontendPath}`);
    deletedCount++;
  }

  if (fs.existsSync(typeFile)) {
    fs.unlinkSync(typeFile);
    console.log(`Deleted type definitions: ${typeFile}`);
    deletedCount++;
  }

  try {
    await removeFromServerFile(feature.camelName, feature.pluralCamelName, apiRoot);
    console.log("Updated server.ts");
  } catch (error) {
    console.warn(`Warning: Could not update server.ts - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    await removeFromBaseApi(feature.name, webSrc);
    console.log("Updated baseApi.ts");
  } catch (error) {
    console.warn(`Warning: Could not update baseApi.ts - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log(`\nFeature "${feature.name}" has been successfully deleted!`);
  console.log(`   ${deletedCount} file(s) removed`);
  console.log("\nNote: The MongoDB collection still exists and must be manually dropped if needed.\n");
}