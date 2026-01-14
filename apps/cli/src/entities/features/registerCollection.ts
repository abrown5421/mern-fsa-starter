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
  console.log(`Registered "${schema.name}" in collectionRegistry`);
}

export async function unregisterCollection(camelName: string, webSrc: string) {
  const registryPath = path.join(webSrc, "features", "collection", "collectionRegistry.ts");
  
  if (!fs.existsSync(registryPath)) {
    throw new Error(`collectionRegistry.ts not found at ${registryPath}`);
  }

  let registryFile = fs.readFileSync(registryPath, "utf-8");

  const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
  const pluralCamelName = `${camelName}s`;
  
  const importPattern = new RegExp(
    `import\\s*\\{[^}]*useGet${pascalName}ByIdQuery[^}]*useCreate${pascalName}Mutation[^}]*useUpdate${pascalName}Mutation[^}]*\\}\\s*from\\s*["']\\.\\.\\/..\\/app\\/store\\/api\\/${pluralCamelName}Api["'];?\\s*`,
    's' 
  );
  
  registryFile = registryFile.replace(importPattern, '');

  const keyPattern = `${camelName}:`;
  const keyIndex = registryFile.indexOf(keyPattern);
  
  if (keyIndex !== -1) {
    let startIndex = keyIndex;
    
    while (startIndex > 0) {
      const char = registryFile[startIndex - 1];
      if (char === '{' || char === ',') {
        while (startIndex > 0 && /\s/.test(registryFile[startIndex - 1])) {
          startIndex--;
        }
        if (registryFile[startIndex - 1] === ',') {
          startIndex--;
        }
        break;
      }
      startIndex--;
    }
    
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let i = keyIndex;
    
    while (i < registryFile.length && registryFile[i] !== '{') {
      i++;
    }
    
    for (; i < registryFile.length; i++) {
      const char = registryFile[i];
      const prevChar = i > 0 ? registryFile[i - 1] : '';
      
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            let endIndex = i + 1;
            while (endIndex < registryFile.length && /[\s,]/.test(registryFile[endIndex])) {
              if (registryFile[endIndex] === ',') {
                endIndex++;
                break;
              }
              endIndex++;
            }
            
            registryFile = registryFile.substring(0, startIndex) + registryFile.substring(endIndex);
            break;
          }
        }
      }
    }
  }

  registryFile = registryFile.replace(/,\s*,/g, ',');
  registryFile = registryFile.replace(/,(\s*)\};/g, '$1};');
  registryFile = registryFile.replace(/\n\n\n+/g, '\n\n');

  const formatted = await prettier.format(registryFile, { parser: "typescript" });
  fs.writeFileSync(registryPath, formatted);
}