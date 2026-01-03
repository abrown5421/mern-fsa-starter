import { toCamelCase } from "../../../shared/case.js";

type FieldType = 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId' | 'Array' | 'Mixed';

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

export function generateModel(schema: FeatureSchema, addTimestamps: boolean): string {
  const camelName = toCamelCase(schema.name);
  const interfaceName = `I${schema.name}`;
  
  const interfaceFields = schema.fields
    .map(field => {
      let tsType = mongooseTypeToTS(field.type);
      const optional = !field.required ? '?' : '';
      return `  ${field.name}${optional}: ${tsType};`;
    })
    .join('\n');

  const schemaFields = schema.fields
    .map(field => {
      const fieldDef = buildMongooseFieldDef(field);
      return `    ${field.name}: ${fieldDef},`;
    })
    .join('\n');

  const timestampFields = addTimestamps
    ? '\n  createdAt: Date;\n  updatedAt: Date;'
    : '';

  const timestampOption = addTimestamps
    ? ',\n  { timestamps: true }'
    : '';

  return `import mongoose, { Schema, Document } from 'mongoose';

export interface ${interfaceName} extends Document {
${interfaceFields}${timestampFields}
}

const ${schema.name}Schema: Schema<${interfaceName}> = new Schema(
  {
${schemaFields}
  }${timestampOption}
);

export const ${schema.name}Model = mongoose.model<${interfaceName}>('${schema.name}', ${schema.name}Schema);
`;
}

function mongooseTypeToTS(type: FieldType): string {
  switch (type) {
    case 'String':
      return 'string';
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'Date':
      return 'Date';
    case 'ObjectId':
      return 'string';
    case 'Array':
      return 'any[]';
    case 'Mixed':
      return 'any';
    default:
      return 'any';
  }
}

function buildMongooseFieldDef(field: FieldDefinition): string {
  const parts: string[] = [];
  
  parts.push(`type: ${field.type === 'ObjectId' ? 'Schema.Types.ObjectId' : field.type}`);
  
  if (field.required) {
    parts.push('required: true');
  }
  
  if (field.unique) {
    parts.push('unique: true');
  }
  
  if (field.default !== undefined) {
    if (field.type === 'Boolean' || field.type === 'Number') {
      parts.push(`default: ${field.default}`);
    } else {
      parts.push(`default: '${field.default}'`);
    }
  }
  
  if (field.enum && field.enum.length > 0) {
    parts.push(`enum: [${field.enum.map(v => `'${v}'`).join(', ')}]`);
  }
  
  if (field.ref) {
    parts.push(`ref: '${field.ref}'`);
  }
  
  return `{ ${parts.join(', ')} }`;
}