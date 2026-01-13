import fs from "fs";
import path from "path";
import prettier from "prettier";
import { webSrc } from "../../shared/paths.js"; 

export type FieldType =
  | "String"
  | "Number"
  | "Boolean"
  | "Date"
  | "ObjectId"
  | "Array"
  | "Mixed";

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  unique?: boolean;
  default?: string;
  enum?: string[];
  ref?: string;
}

export interface FeatureSchema {
  name: string;
  fields: FieldDefinition[];
}

export async function registerCollection(schema: FeatureSchema) {
  const registryPath = path.join(webSrc, "features", "collection", "collectionRegistry.ts");
  const camelName = schema.name.charAt(0).toLowerCase() + schema.name.slice(1);
  const pluralCamelName = `${camelName}s`;

  let registryFile = fs.readFileSync(registryPath, "utf-8");

  if (registryFile.includes(`${camelName}:`)) {
    console.log(`Collection "${camelName}" is already registered`);
    return;
  }

  const apiImport = `import { useGet${schema.name}ByIdQuery, useCreate${schema.name}Mutation, useUpdate${schema.name}Mutation } from "../../app/store/api/${pluralCamelName}Api";\n`;
  if (!registryFile.includes(apiImport)) {
    registryFile = apiImport + registryFile;
  }

  const newEntry = `
  ${camelName}: {
    feature: "${camelName}",
    api: {
      useGetById: useGet${schema.name}ByIdQuery,
      useCreate: useCreate${schema.name}Mutation,
      useUpdate: useUpdate${schema.name}Mutation,
    },
    schema: {
      name: "${schema.name}",
      fields: ${JSON.stringify(schema.fields, null, 2)}
    },
  },`;

  registryFile = registryFile.replace(
    /(export const collectionRegistry: Record<string, CollectionConfig> = {)([\s\S]*?)(\n};)/,
    (_, start, existingEntries, end) => {
      return `${start}${existingEntries}${newEntry}${end}`;
    }
  );

  const formatted = await prettier.format(registryFile, { parser: "typescript" });
  fs.writeFileSync(registryPath, formatted);
  console.log(`✓ Registered "${schema.name}" in collectionRegistry`);
}