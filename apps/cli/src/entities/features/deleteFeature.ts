import fs from "node:fs";
import path from "node:path";
import { input, confirm, select } from "@inquirer/prompts";
import { isPascalCase, toCamelCase } from "../../shared/case.js";
import { webSrc, repoRoot } from "../../shared/paths.js";
import { removeAppRoutes } from "./updateAppRoutes.js";
import { removeAdminSidebarLink } from "./updateAdminSidebar.js";
import { removeFromBaseApi } from "./updateBaseApi.js";
import { removeFromServerFile } from "./updateServerFile.js";
import { unregisterCollection } from "./registerCollection.js";

export async function deleteFeature() {
  console.log("\n🗑️  Deleting a feature...\n");

  const apiRoot = path.join(repoRoot, "apps/api/src");
  const entitiesDir = path.join(apiRoot, "entities");
  
  let existingFeatures: string[] = [];
  if (fs.existsSync(entitiesDir)) {
    existingFeatures = fs.readdirSync(entitiesDir)
      .filter(item => {
        const itemPath = path.join(entitiesDir, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .map(dir => {
        return dir.charAt(0).toUpperCase() + dir.slice(1);
      });
  }

  if (existingFeatures.length === 0) {
    console.log("  No features found to delete");
    return;
  }

  let featureName: string;

  const selectionMethod = await select({
    message: "How would you like to select the feature to delete?",
    choices: [
      { name: "Choose from list", value: "list" },
      { name: "Enter manually", value: "manual" },
    ],
  });

  if (selectionMethod === "list") {
    featureName = await select({
      message: "Select feature to delete:",
      choices: existingFeatures.map(f => ({ name: f, value: f })),
    });
  } else {
    featureName = await input({
      message: 'Enter feature name to delete (PascalCase, e.g. "Product"):',
      validate: (value) => {
        if (!isPascalCase(value)) return "Feature name must be PascalCase";
        return true;
      },
    });
  }

  const camelName = toCamelCase(featureName);
  const pluralCamelName = `${camelName}s`;

  const backendFeatureDir = path.join(apiRoot, "entities", camelName);
  const frontendApiFile = path.join(webSrc, "app", "store", "api", `${pluralCamelName}Api.ts`);
  const frontendTypesFile = path.join(webSrc, "types", `${camelName}.types.ts`);
  const cmsPageDir = path.join(webSrc, "pages", `admin${featureName}`);
  const routeFile = path.join(apiRoot, "routes", `${pluralCamelName}.routes.ts`);

  const checks = {
    backend: fs.existsSync(backendFeatureDir),
    route: fs.existsSync(routeFile),
    frontendApi: fs.existsSync(frontendApiFile),
    frontendTypes: fs.existsSync(frontendTypesFile),
    cms: fs.existsSync(cmsPageDir),
  };

  if (!checks.backend && !checks.route && !checks.frontendApi && !checks.frontendTypes && !checks.cms) {
    console.log(`  Feature "${featureName}" does not appear to exist`);
    return;
  }

  console.log("\n📋 The following will be deleted:\n");
  if (checks.backend) console.log(`  Backend entity: ${backendFeatureDir}`);
  if (checks.route) console.log(`  Backend route: ${routeFile}`);
  if (checks.frontendApi) console.log(`  Frontend API: ${frontendApiFile}`);
  if (checks.frontendTypes) console.log(`  Frontend types: ${frontendTypesFile}`);
  if (checks.cms) console.log(`  CMS page: ${cmsPageDir}`);
  console.log(`  Server.ts route registration`);
  console.log(`  BaseApi tag type`);
  console.log(`  App.tsx routes`);
  console.log(`  AdminSidebar link`);
  console.log(`  Collection registry entry`);

  const confirmDelete = await confirm({
    message: `Are you sure you want to delete feature "${featureName}"? This cannot be undone.`,
    default: false,
  });

  if (!confirmDelete) {
    console.log("\n  Deletion cancelled");
    return;
  }

  console.log("\n🗑️  Deleting files and updating references...\n");

  if (checks.backend) {
    fs.rmSync(backendFeatureDir, { recursive: true, force: true });
    console.log(`Deleted backend entity directory`);
  }

  if (checks.route) {
    fs.unlinkSync(routeFile);
    console.log(`Deleted route file`);
  }

  if (checks.frontendApi) {
    fs.unlinkSync(frontendApiFile);
    console.log(`Deleted frontend API service`);
  }

  if (checks.frontendTypes) {
    fs.unlinkSync(frontendTypesFile);
    console.log(`Deleted frontend types`);
  }

  if (checks.cms) {
    fs.rmSync(cmsPageDir, { recursive: true, force: true });
    console.log(`Deleted CMS page directory`);
  }

  try {
    await removeFromServerFile(camelName, pluralCamelName, apiRoot);
    console.log(`Removed route from server.ts`);
  } catch (error) {
    console.log(`Could not update server.ts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    await removeFromBaseApi(featureName, webSrc);
    console.log(`Removed tag type from baseApi.ts`);
  } catch (error) {
    console.log(`Could not update baseApi.ts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    await removeAppRoutes(featureName, webSrc);
    console.log(`Removed routes from App.tsx`);
  } catch (error) {
    console.log(`Could not update App.tsx: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    await removeAdminSidebarLink(featureName, webSrc);
    console.log(`Removed link from AdminSidebar.tsx`);
  } catch (error) {
    console.log(`Could not update AdminSidebar.tsx: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    await unregisterCollection(camelName, webSrc);
    console.log(`Removed from collection registry`);
  } catch (error) {
    console.log(`Could not update collection registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log(`\n Feature "${featureName}" has been successfully deleted!`);
}