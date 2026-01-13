import fs from "node:fs";
import path from "node:path";
import { select, confirm } from "@inquirer/prompts";
import { toCamelCase } from "../../shared/case.js";
import { webSrc, repoRoot } from "../../shared/paths.js";
import { removeFromServerFile } from "./removeFromServerFile.js";
import { removeFromBaseApi } from "./removeFromBaseApi.js";
import { removeAppRoutes } from "./templates/updateAppRoutes.js";
import { removeAdminSidebarLink } from "./templates/updateAdminSidebar.js";
import { removeFromCollectionEditor } from "./removeFromCollectionEditor.js";

interface FeatureInfo {
  name: string;
  camelName: string;
  pluralCamelName: string;
  hasBackend: boolean;
  hasFrontend: boolean;
  hasCms: boolean;
  backendPath?: string;
  frontendPath?: string;
  routePath?: string;
  cmsPagePath?: string;
}

function getAvailableFeatures(): FeatureInfo[] {
  const features: FeatureInfo[] = [];
  const apiRoot = path.join(repoRoot, "apps/api/src");
  const entitiesDir = path.join(apiRoot, "entities");
  const routesDir = path.join(apiRoot, "routes");
  const frontendApiDir = path.join(webSrc, "app", "store", "api");
  const pagesDir = path.join(webSrc, "pages");

  if (fs.existsSync(entitiesDir)) {
    const entities = fs.readdirSync(entitiesDir);
    
    for (const entity of entities) {
      const entityPath = path.join(entitiesDir, entity);
      
      if (!fs.statSync(entityPath).isDirectory() || entity === "user") {
        continue;
      }

      const camelName = entity;
      const capitalizedName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
      const pluralCamelName = `${camelName}s`;
      const routePath = path.join(routesDir, `${pluralCamelName}.routes.ts`);
      const frontendPath = path.join(frontendApiDir, `${pluralCamelName}Api.ts`);
      const cmsPagePath = path.join(pagesDir, `admin${capitalizedName}`);

      features.push({
        name: capitalizedName,
        camelName,
        pluralCamelName,
        hasBackend: true,
        hasFrontend: fs.existsSync(frontendPath),
        hasCms: fs.existsSync(cmsPagePath),
        backendPath: entityPath,
        routePath: fs.existsSync(routePath) ? routePath : undefined,
        frontendPath: fs.existsSync(frontendPath) ? frontendPath : undefined,
        cmsPagePath: fs.existsSync(cmsPagePath) ? cmsPagePath : undefined,
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
  console.log("\n Delete Feature\n");

  const features = getAvailableFeatures();

  if (features.length === 0) {
    console.log(" No features available to delete.");
    console.log("   (The 'user' feature is protected and cannot be deleted)\n");
    return;
  }

  const choices = features.map((f) => {
    const parts = [];
    if (f.hasBackend) parts.push("Backend");
    if (f.hasFrontend) parts.push("Frontend");
    if (f.hasCms) parts.push("CMS");
    
    return {
      name: `${f.name} (${parts.join(" + ")})`,
      value: f.camelName,
    };
  });

  const selectedFeature = await select({
    message: "Which feature would you like to delete?",
    choices,
  });

  const feature = features.find((f) => f.camelName === selectedFeature);

  if (!feature) {
    throw new Error("Feature not found");
  }

  console.log("\n WARNING: This action will delete the following:\n");
  
  if (feature.backendPath) {
    console.log(`    Backend entity folder: ${feature.backendPath}`);
  }
  if (feature.routePath) {
    console.log(` Route file: ${feature.routePath}`);
  }
  if (feature.frontendPath) {
    console.log(` Frontend API file: ${feature.frontendPath}`);
  }
  if (feature.cmsPagePath) {
    console.log(`    CMS page folder: ${feature.cmsPagePath}`);
  }
  
  const typesDir = path.join(webSrc, "types");
  const typeFile = path.join(typesDir, `${feature.camelName}.types.ts`);
  if (fs.existsSync(typeFile)) {
    console.log(` Type definitions: ${typeFile}`);
  }

  console.log("\n   It will also update:");
  console.log("   - server.ts (remove route import and usage)");
  console.log("   - baseApi.ts (remove tag type)");
  
  if (feature.hasCms) {
    console.log("   - App.tsx (remove CMS routes)");
    console.log("   - AdminSidebar.tsx (remove navigation link)");
    console.log("   - CollectionEditor.tsx (remove feature type support)");
  }
  
  console.log("\n    ALL DATA in the MongoDB collection will be PERMANENTLY DELETED!");

  const confirmDelete = await confirm({
    message: `\nAre you absolutely sure you want to delete the "${feature.name}" feature?`,
    default: false,
  });

  if (!confirmDelete) {
    console.log("\n Feature deletion cancelled.\n");
    return;
  }

  const doubleConfirm = await confirm({
    message: " This cannot be undone. Proceed with deletion?",
    default: false,
  });

  if (!doubleConfirm) {
    console.log("\n Feature deletion cancelled.\n");
    return;
  }

  console.log("\n Deleting feature files...\n");

  const apiRoot = path.join(repoRoot, "apps/api/src");
  let deletedCount = 0;

  if (feature.backendPath && fs.existsSync(feature.backendPath)) {
    deleteFolderRecursive(feature.backendPath);
    console.log(` Deleted entity folder: ${feature.backendPath}`);
    deletedCount++;
  }

  if (feature.routePath && fs.existsSync(feature.routePath)) {
    fs.unlinkSync(feature.routePath);
    console.log(` Deleted route file: ${feature.routePath}`);
    deletedCount++;
  }

  if (feature.frontendPath && fs.existsSync(feature.frontendPath)) {
    fs.unlinkSync(feature.frontendPath);
    console.log(` Deleted frontend API file: ${feature.frontendPath}`);
    deletedCount++;
  }

  if (fs.existsSync(typeFile)) {
    fs.unlinkSync(typeFile);
    console.log(` Deleted type definitions: ${typeFile}`);
    deletedCount++;
  }

  if (feature.cmsPagePath && fs.existsSync(feature.cmsPagePath)) {
    deleteFolderRecursive(feature.cmsPagePath);
    console.log(` Deleted CMS page folder: ${feature.cmsPagePath}`);
    deletedCount++;
  }

  try {
    await removeFromServerFile(feature.camelName, feature.pluralCamelName, apiRoot);
    console.log(" Updated server.ts");
  } catch (error) {
    console.warn(` Warning: Could not update server.ts - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    await removeFromBaseApi(feature.name, webSrc);
    console.log(" Updated baseApi.ts");
  } catch (error) {
    console.warn(` Warning: Could not update baseApi.ts - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (feature.hasCms) {
    try {
      await removeAppRoutes(feature.name, webSrc);
      console.log(" Updated App.tsx");
    } catch (error) {
      console.warn(` Warning: Could not update App.tsx - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      await removeAdminSidebarLink(feature.name, webSrc);
      console.log(" Updated AdminSidebar.tsx");
    } catch (error) {
      console.warn(` Warning: Could not update AdminSidebar.tsx - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      await removeFromCollectionEditor(feature.name, webSrc);
      console.log(" Updated CollectionEditor.tsx");
    } catch (error) {
      console.warn(` Warning: Could not update CollectionEditor.tsx - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`\n Feature "${feature.name}" has been successfully deleted!`);
  console.log(`   ${deletedCount} file(s) removed`);
  console.log("\n Note: The MongoDB collection still exists and must be manually dropped if needed.\n");
}