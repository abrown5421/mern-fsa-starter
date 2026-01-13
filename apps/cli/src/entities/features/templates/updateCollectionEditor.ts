import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

interface FieldDefinition {
  name: string;
  type: string;
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

export async function updateCollectionEditor(
  schema: FeatureSchema,
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

  const camelName = schema.name.charAt(0).toLowerCase() + schema.name.slice(1);
  const capitalizedName = schema.name;
  const pluralCamelName = `${camelName}s`;

  if (!content.includes(`'${camelName}'`)) {
    const featureTypeRegex = /type FeatureType = ([^;]+);/;
    const match = content.match(featureTypeRegex);

    if (match) {
      const currentTypes = match[1].trim();
      const newTypes = `${currentTypes} | '${camelName}'`;
      content = content.replace(featureTypeRegex, `type FeatureType = ${newTypes};`);
    }
  }

  const importStatement = `import { useGet${capitalizedName}ByIdQuery, useCreate${capitalizedName}Mutation, useUpdate${capitalizedName}Mutation } from '../../app/store/api/${pluralCamelName}Api';`;

  if (!content.includes(importStatement)) {
    const userImportRegex = /import { useGetUserByIdQuery[^;]+;/;
    const userImport = content.match(userImportRegex);

    if (userImport) {
      content = content.replace(
        userImport[0],
        `${userImport[0]}\n${importStatement}`
      );
    }
  }

  const queryHook = `
    const { data: ${camelName}Data, isLoading: ${camelName}Loading } =
        useGet${capitalizedName}ByIdQuery(id || "", {
        skip: featureType !== "${camelName}" || mode !== "edit" || !id,
        });
    `;

    if (!content.includes(`useGet${capitalizedName}ByIdQuery`)) {
    const insertionPoint = content.indexOf("useGetUserByIdQuery");
    if (insertionPoint !== -1) {
        const endOfHook =
        content.indexOf(");", insertionPoint) + 2;

        content =
        content.slice(0, endOfHook) +
        queryHook +
        content.slice(endOfHook);
    }
  }

  const mutationHooks = `  const [create${capitalizedName}, { isLoading: creating${capitalizedName} }] = useCreate${capitalizedName}Mutation();
  const [update${capitalizedName}, { isLoading: updating${capitalizedName} }] = useUpdate${capitalizedName}Mutation();`;

  if (!content.includes(mutationHooks)) {
    const userMutationRegex = /const \[updateUser[^\]]+\] = useUpdateUserMutation\(\);/;
    const userMutation = content.match(userMutationRegex);

    if (userMutation) {
      content = content.replace(
        userMutation[0],
        `${userMutation[0]}\n${mutationHooks}`
      );
    }
  }

  content = content.replace(
    /const isLoading = ([^;]+);/,
    (match, expr) =>
        expr.includes(`${camelName}Loading`)
        ? match
        : `const isLoading = ${expr} || ${camelName}Loading;`
  );

  content = content.replace(
    /const isSaving = creatingUser \|\| updatingUser;/,
    `const isSaving = creatingUser || updatingUser || creating${capitalizedName} || updating${capitalizedName};`
  );

  const useEffectCase = `      if (featureType === '${camelName}' && ${camelName}Data) {
        setFormData(${camelName}Data);
      }`;

  const useEffectRegex = /if \(mode === 'edit'\) {([^}]+)}/;
  const useEffectMatch = content.match(useEffectRegex);

  if (useEffectMatch && !content.includes(useEffectCase)) {
    const editBlock = useEffectMatch[0];
    const newEditBlock = editBlock.replace(
      /if \(featureType === 'user' && userData\) {[^}]+}/,
      (match) => `${match}\n${useEffectCase}`
    );
    content = content.replace(editBlock, newEditBlock);
  }

  const createInit = generateCreateInitialization(schema);
  const createInitCase = `      if (featureType === '${camelName}') {
        setFormData(${createInit});
      }`;

  if (!content.includes(`featureType === '${camelName}'`) || !content.includes(createInit)) {
    const userCreatePattern = /if \(featureType === 'user'\) {\s*setFormData\(\{[^}]+}\);?\s*}/;
    const userCreateMatch = content.match(userCreatePattern);
    
    if (userCreateMatch) {
      content = content.replace(
        userCreateMatch[0],
        `${userCreateMatch[0]}\n${createInitCase}`
      );
    }
  }

  const validationCase = generateValidation(schema);
  
  if (!content.includes(`if (featureType === '${camelName}')`)) {
    const userValidationPattern = /if \(featureType === 'user'\) {\s*if \(!formData\.firstName[\s\S]*?}\s*}/;
    const userValidationMatch = content.match(userValidationPattern);
    
    if (userValidationMatch) {
      content = content.replace(
        userValidationMatch[0],
        `${userValidationMatch[0]}\n    ${validationCase}`
      );
    }
  }

  const submitCase = `      if (featureType === '${camelName}') {
        if (mode === 'create') {
          await create${capitalizedName}(formData).unwrap();
        } else if (id) {
          await update${capitalizedName}({ id, data: formData }).unwrap();
        }
      }`;

  if (!content.includes(`featureType === '${camelName}'`) || !content.includes(`create${capitalizedName}`)) {
    const userSubmitPattern = /if \(featureType === 'user'\) {\s*if \(mode === 'create'\) {[\s\S]*?}\s*}/;
    const userSubmitMatch = content.match(userSubmitPattern);
    
    if (userSubmitMatch) {
      content = content.replace(
        userSubmitMatch[0],
        `${userSubmitMatch[0]}\n${submitCase}`
      );
    }
  }

  const formFieldsJSX = generateFormFieldsJSX(schema);
  const formFieldsCase = `          {featureType === '${camelName}' && (
            <>
${formFieldsJSX}
            </>
          )}`;

  const userFieldsRegex = /{featureType === 'user' && \([\s\S]+?<\/>\s+\)}/;
  const userFieldsMatch = content.match(userFieldsRegex);

  if (userFieldsMatch && !content.includes(`featureType === '${camelName}'`)) {
    content = content.replace(
      userFieldsMatch[0],
      `${userFieldsMatch[0]}\n\n${formFieldsCase}`
    );
  }

  const formatted = await prettier.format(content, {
    parser: "typescript",
  });

  fs.writeFileSync(editorFile, formatted);
  console.log(`✓ Updated CollectionEditor.tsx with ${capitalizedName} support`);
}

function generateCreateInitialization(schema: FeatureSchema): string {
  const fields = schema.fields.map((field) => {
    let defaultValue = "''";
    if (field.type === "Number") defaultValue = "0";
    if (field.type === "Boolean") defaultValue = "false";
    if (field.type === "Array") defaultValue = "[]";
    if (field.default) {
      if (field.type === "String") defaultValue = `'${field.default}'`;
      else defaultValue = field.default;
    }
    return `${field.name}: ${defaultValue}`;
  });

  return `{ ${fields.join(", ")} }`;
}

function generateValidation(schema: FeatureSchema): string {
  const validations = schema.fields
    .filter((f) => f.required)
    .map((field) => {
      if (field.type === "String") {
        return `      if (!formData.${field.name}?.trim()) newErrors.${field.name} = '${formatLabel(field.name)} is required';`;
      } else {
        return `      if (!formData.${field.name}) newErrors.${field.name} = '${formatLabel(field.name)} is required';`;
      }
    });

  const camelName = schema.name.charAt(0).toLowerCase() + schema.name.slice(1);

  return `if (featureType === '${camelName}') {
${validations.join("\n")}
    }`;
}

function generateFormFieldsJSX(schema: FeatureSchema): string {
  return schema.fields
    .map((field) => {
      const label = formatLabel(field.name);
      const required = field.required ? " *" : "";

      if (field.enum && field.enum.length > 0) {
        const options = field.enum
          .map((val) => `                  <option value="${val}">${val}</option>`)
          .join("\n");
        return `              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">${label}${required}</label>
                <select
                  value={formData.${field.name} || ''}
                  onChange={(e) => handleChange('${field.name}', e.target.value)}
                  className="w-full input-primary"
                >
                  <option value="">Select...</option>
${options}
                </select>
                {errors.${field.name} && <p className="text-red-500 text-sm mt-1">{errors.${field.name}}</p>}
              </div>`;
      }

      if (field.type === "Boolean") {
        return `              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.${field.name} || false}
                  onChange={(e) => handleChange('${field.name}', e.target.checked)}
                  className="w-5 h-5"
                />
                <label className="text-sm font-medium text-neutral-contrast">${label}</label>
              </div>`;
      }

      if (field.type === "Number") {
        return `              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">${label}${required}</label>
                <input
                  type="number"
                  value={formData.${field.name} || ''}
                  onChange={(e) => handleChange('${field.name}', parseFloat(e.target.value))}
                  className="w-full input-primary"
                />
                {errors.${field.name} && <p className="text-red-500 text-sm mt-1">{errors.${field.name}}</p>}
              </div>`;
      }

      if (field.type === "Date") {
        return `              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">${label}${required}</label>
                <input
                  type="date"
                  value={formData.${field.name} ? new Date(formData.${field.name}).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('${field.name}', e.target.value)}
                  className="w-full input-primary"
                />
                {errors.${field.name} && <p className="text-red-500 text-sm mt-1">{errors.${field.name}}</p>}
              </div>`;
      }

      return `              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">${label}${required}</label>
                <input
                  type="text"
                  value={formData.${field.name} || ''}
                  onChange={(e) => handleChange('${field.name}', e.target.value)}
                  className="w-full input-primary"
                />
                {errors.${field.name} && <p className="text-red-500 text-sm mt-1">{errors.${field.name}}</p>}
              </div>`;
    })
    .join("\n\n");
}

function formatLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}