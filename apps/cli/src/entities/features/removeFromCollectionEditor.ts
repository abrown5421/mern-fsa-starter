import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

export async function removeFromCollectionEditor(
  featureName: string,
  webSrc: string
) {
  const editorFile = path.join(
    webSrc,
    "features",
    "collection",
    "CollectionEditor.tsx"
  );

  if (!fs.existsSync(editorFile)) {
    throw new Error(`CollectionEditor.tsx not found at ${editorFile}`);
  }

  let content = fs.readFileSync(editorFile, "utf-8");

  const camelName = featureName.charAt(0).toLowerCase() + featureName.slice(1);
  const capitalizedName = featureName;
  const pluralCamelName = `${camelName}s`;

  let modified = false;

  const featureTypePattern = new RegExp(`\\s*\\|\\s*'${camelName}'`, "g");
  if (featureTypePattern.test(content)) {
    content = content.replace(featureTypePattern, "");
    modified = true;
  }

  const importPattern = new RegExp(
    `import { useGet${capitalizedName}ByIdQuery, useCreate${capitalizedName}Mutation, useUpdate${capitalizedName}Mutation } from '../../app/store/api/${pluralCamelName}Api';\\s*`,
    "g"
  );
  if (importPattern.test(content)) {
    content = content.replace(importPattern, "");
    modified = true;
  }

  const queryPattern = new RegExp(
    `const { data: ${camelName}Data, isLoading: ${camelName}Loading } = useGet${capitalizedName}ByIdQuery\\([^;]+;\\s*`,
    "g"
  );
  if (queryPattern.test(content)) {
    content = content.replace(queryPattern, "");
    modified = true;
  }

  const mutationPattern = new RegExp(
    `const \\[create${capitalizedName}[^;]+;\\s*const \\[update${capitalizedName}[^;]+;\\s*`,
    "gs"
  );
  if (mutationPattern.test(content)) {
    content = content.replace(mutationPattern, "");
    modified = true;
  }

  const isLoadingPattern = new RegExp(`\\s*\\|\\|\\s*${camelName}Loading`, "g");
  if (isLoadingPattern.test(content)) {
    content = content.replace(isLoadingPattern, "");
    modified = true;
  }

  const isSavingPattern = new RegExp(
    `\\s*\\|\\|\\s*creating${capitalizedName}\\s*\\|\\|\\s*updating${capitalizedName}`,
    "g"
  );
  if (isSavingPattern.test(content)) {
    content = content.replace(isSavingPattern, "");
    modified = true;
  }

  const editCasePattern = new RegExp(
    `if \\(featureType === '${camelName}' && ${camelName}Data\\) {[^}]+}\\s*`,
    "g"
  );
  if (editCasePattern.test(content)) {
    content = content.replace(editCasePattern, "");
    modified = true;
  }

  const createCasePattern = new RegExp(
    `if \\(featureType === '${camelName}'\\) {\\s*setFormData\\([^)]+\\);\\s*}\\s*`,
    "g"
  );
  if (createCasePattern.test(content)) {
    content = content.replace(createCasePattern, "");
    modified = true;
  }

  const validationPattern = new RegExp(
    `if \\(featureType === '${camelName}'\\) {[\\s\\S]*?}\\s*`,
    "g"
  );
  
  const validationMatch = content.match(
    new RegExp(`if \\(featureType === '${camelName}'\\) {[\\s\\S]*?}(?=\\s*\\n\\s*setErrors)`)
  );
  if (validationMatch) {
    content = content.replace(validationMatch[0], "");
    modified = true;
  }

  const submitPattern = new RegExp(
    `if \\(featureType === '${camelName}'\\) {[\\s\\S]*?await update${capitalizedName}[^}]+}\\s*}\\s*`,
    "g"
  );
  if (submitPattern.test(content)) {
    content = content.replace(submitPattern, "");
    modified = true;
  }

  const formFieldsPattern = new RegExp(
    `{featureType === '${camelName}' && \\([\\s\\S]*?<\\/>[\\s\\S]*?\\)}\\s*`,
    "g"
  );
  if (formFieldsPattern.test(content)) {
    content = content.replace(formFieldsPattern, "");
    modified = true;
  }

  if (!modified) {
    console.log(`ℹ️  No references to '${featureName}' found in CollectionEditor.tsx`);
    return;
  }

  content = content.replace(/\n\n\n+/g, "\n\n");

  const formatted = await prettier.format(content, {
    parser: "typescript",
  });

  fs.writeFileSync(editorFile, formatted);
  console.log(` Removed '${featureName}' from CollectionEditor.tsx`);
}