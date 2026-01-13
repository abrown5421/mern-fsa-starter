import fs from "node:fs";
import path from "node:path";
import { input, confirm, select } from "@inquirer/prompts";
import { isPascalCase, toCamelCase } from "../../shared/case.js";
import { webSrc, repoRoot } from "../../shared/paths.js";
import { generateModel } from "./templates/modelTemplate.js";
import { generateRoute } from "./templates/routeTemplate.js";
import { generateApiService } from "./templates/apiServiceTemplate.js";
import { generateTypeDefinitions } from "./templates/typeTemplate.js";
import { generateCmsPage } from "./templates/generateCmsPage.js";
import { updateServerFile } from "./updateServerFile.js";
import { updateBaseApi } from "./updateBaseApi.js";
import prettier from "prettier";
import { updateCollectionEditor } from "./templates/updateCollectionEditor.js";
import { updateAdminSidebar } from "./templates/updateAdminSidebar.js";
import { updateAppRoutes } from "./templates/updateAppRoutes.js";

type FieldType =
  | "String"
  | "Number"
  | "Boolean"
  | "Date"
  | "ObjectId"
  | "Array"
  | "Mixed";

interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  unique?: boolean;
  default?: string;
  enum?: string[];
  ref?: string;
}

interface FeatureSchema {
  name: string;
  fields: FieldDefinition[];
}

function isPlural(word: string): boolean {
  const lower = word.toLowerCase();
  if (lower.endsWith("ies")) return true;
  if (lower.endsWith("ses")) return true;
  if (lower.endsWith("s") && !lower.endsWith("ss")) return true;
  return false;
}

export async function addFeature() {
  console.log("\n Creating a new feature...\n");

  let featureName: string;

  while (true) {
    featureName = await input({
      message:
        'Enter feature name (PascalCase, singular — e.g. "Product", "BlogPost"):',
      validate: (value) => {
        if (!isPascalCase(value)) {
          return "Feature name must be PascalCase";
        }

        if (isPlural(value)) {
          return 'Feature name must be singular (e.g. "Product", not "Products")';
        }

        return true;
      },
    });

    const confirmName = await confirm({
      message: `Create feature "${featureName}"?`,
      default: true,
    });

    if (confirmName) break;
  }

  const camelName = toCamelCase(featureName);
  const pluralCamelName = `${camelName}s`;

  const apiRoot = path.join(repoRoot, "apps/api/src");
  const backendFeatureDir = path.join(apiRoot, "entities", camelName);
  const frontendFeatureDir = path.join(webSrc, "app", "store", "api");
  const apiFile = path.join(frontendFeatureDir, `${pluralCamelName}Api.ts`);
  const cmsPageDir = path.join(webSrc, "pages", `admin${featureName}`);

  if (fs.existsSync(backendFeatureDir)) {
    throw new Error(
      `Backend feature "${featureName}" already exists at ${backendFeatureDir}`,
    );
  }

  if (fs.existsSync(apiFile)) {
    throw new Error(`Frontend API service for "${featureName}" already exists`);
  }

  if (fs.existsSync(cmsPageDir)) {
    throw new Error(`CMS page for "${featureName}" already exists at ${cmsPageDir}`);
  }

  const inputMethod = await select({
    message: "How would you like to define the feature schema?",
    choices: [
      { name: "Interactive (step-by-step)", value: "interactive" },
      { name: "JSON input", value: "json" },
    ],
  });

  let schema: FeatureSchema;

  if (inputMethod === "json") {
    schema = await getSchemaFromJson(featureName);
  } else {
    schema = await getSchemaInteractively(featureName);
  }

  const addTimestamps = await confirm({
    message: "Add createdAt and updatedAt timestamps?",
    default: true,
  });

  const addToCms = await confirm({
    message: "Add CMS interface for this feature?",
    default: true,
  });

  console.log("\n📦 Generating files...\n");

  await generateBackendFiles(schema, addTimestamps, apiRoot);

  await generateFrontendFiles(schema);

  await updateBaseApi(featureName, webSrc);
  
  await updateServerFile(camelName, pluralCamelName, apiRoot);

  if (addToCms) {
    console.log("\n Generating CMS interface...\n");
    await generateCmsFiles(schema, webSrc);
  }

  console.log(`\n Feature "${featureName}" created successfully!`);
  console.log(`\n Backend files created in: ${backendFeatureDir}`);
  console.log(` Frontend API service created: ${apiFile}`);
  
  if (addToCms) {
    console.log(` CMS page created in: ${cmsPageDir}`);
    console.log(`\n You can now access the CMS at: /admin-${camelName}`);
  }
  
  console.log(`\n Server.ts has been updated with the new route`);
}

async function getSchemaFromJson(featureName: string): Promise<FeatureSchema> {
  console.log("\n Enter your schema as JSON. Example:");
  console.log(
    JSON.stringify(
      {
        fields: [
          { name: "title", type: "String", required: true },
          { name: "price", type: "Number", required: true },
          {
            name: "inStock",
            type: "Boolean",
            required: false,
            default: "true",
          },
        ],
      },
      null,
      2,
    ),
  );

  const jsonInput = await input({
    message: "Paste your JSON schema:",
    validate: (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return "Invalid JSON format";
      }
    },
  });

  const parsed = JSON.parse(jsonInput);

  if (!parsed.fields || !Array.isArray(parsed.fields)) {
    throw new Error('JSON must contain a "fields" array');
  }

  return {
    name: featureName,
    fields: parsed.fields,
  };
}

async function getSchemaInteractively(
  featureName: string,
): Promise<FeatureSchema> {
  const fields: FieldDefinition[] = [];
  let addMore = true;

  console.log("\n Define your fields (you can add multiple):\n");

  while (addMore) {
    const fieldName = await input({
      message: `Field name (camelCase):`,
      validate: (value) => value.length > 0 || "Field name cannot be empty",
    });

    const fieldType = await select<FieldType>({
      message: "Field type:",
      choices: [
        { name: "String", value: "String" },
        { name: "Number", value: "Number" },
        { name: "Boolean", value: "Boolean" },
        { name: "Date", value: "Date" },
        { name: "ObjectId (reference)", value: "ObjectId" },
        { name: "Array", value: "Array" },
        { name: "Mixed (any)", value: "Mixed" },
      ],
    });

    const required = await confirm({
      message: "Is this field required?",
      default: false,
    });

    const field: FieldDefinition = {
      name: fieldName,
      type: fieldType,
      required,
    };

    if (fieldType === "String") {
      const isUnique = await confirm({
        message: "Should this field be unique?",
        default: false,
      });
      if (isUnique) field.unique = true;

      const hasEnum = await confirm({
        message: "Does this field have enum values?",
        default: false,
      });
      if (hasEnum) {
        const enumInput = await input({
          message: "Enter enum values (comma-separated):",
        });
        field.enum = enumInput.split(",").map((v) => v.trim());
      }
    }

    if (fieldType === "ObjectId") {
      const ref = await input({
        message: 'Reference model name (e.g., "User"):',
      });
      field.ref = ref;
    }

    const hasDefault = await confirm({
      message: "Set a default value?",
      default: false,
    });
    if (hasDefault) {
      field.default = await input({
        message: "Default value:",
      });
    }

    fields.push(field);

    addMore = await confirm({
      message: "Add another field?",
      default: true,
    });
  }

  return {
    name: featureName,
    fields,
  };
}

async function generateBackendFiles(
  schema: FeatureSchema,
  addTimestamps: boolean,
  apiRoot: string,
) {
  const camelName = toCamelCase(schema.name);
  const backendFeatureDir = path.join(apiRoot, "entities", camelName);

  fs.mkdirSync(backendFeatureDir, { recursive: true });

  const modelContent = generateModel(schema, addTimestamps);
  const modelFile = path.join(backendFeatureDir, `${camelName}.model.ts`);
  fs.writeFileSync(
    modelFile,
    await prettier.format(modelContent, { parser: "typescript" }),
  );
  console.log(` Created ${camelName}.model.ts`);

  const routeContent = generateRoute(schema);
  const routeDir = path.join(apiRoot, "routes");
  const routeFile = path.join(routeDir, `${camelName}s.routes.ts`);
  fs.writeFileSync(
    routeFile,
    await prettier.format(routeContent, { parser: "typescript" }),
  );
  console.log(` Created ${camelName}s.routes.ts`);
}

async function generateFrontendFiles(schema: FeatureSchema) {
  const camelName = toCamelCase(schema.name);
  const pluralCamelName = `${camelName}s`;

  const typesDir = path.join(webSrc, "types");
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  const typeContent = generateTypeDefinitions(schema);
  const typeFile = path.join(typesDir, `${camelName}.types.ts`);
  fs.writeFileSync(
    typeFile,
    await prettier.format(typeContent, { parser: "typescript" }),
  );
  console.log(` Created ${camelName}.types.ts`);

  const apiContent = generateApiService(schema);
  const apiDir = path.join(webSrc, "app", "store", "api");
  const apiFile = path.join(apiDir, `${pluralCamelName}Api.ts`);
  fs.writeFileSync(
    apiFile,
    await prettier.format(apiContent, { parser: "typescript" }),
  );
  console.log(` Created ${pluralCamelName}Api.ts`);
}

async function generateCmsFiles(schema: FeatureSchema, webSrc: string) {
  const camelName = toCamelCase(schema.name);
  const capitalizedName = schema.name;
  
  const cmsPageDir = path.join(webSrc, "pages", `admin${capitalizedName}`);
  fs.mkdirSync(cmsPageDir, { recursive: true });

  const cmsPageContent = generateCmsPage(schema);
  const cmsPageFile = path.join(cmsPageDir, `Admin${capitalizedName}.tsx`);
  fs.writeFileSync(
    cmsPageFile,
    await prettier.format(cmsPageContent, { parser: "typescript" }),
  );
  console.log(` Created Admin${capitalizedName}.tsx`);

  await updateCollectionEditor(schema, webSrc);

  await updateAppRoutes(capitalizedName, webSrc); 

  await updateAdminSidebar(capitalizedName, webSrc);
}