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
  required?: boolean;
  unique?: boolean;
  default?: string;
  enum?: string[];
  ref?: string;
}

export interface FeatureSchema {
  name: string;
  fields: FieldDefinition[];
}

export interface CollectionConfig {
  feature: string;
  api: {
    useGetById: any;
    useCreate: any;
    useUpdate: any;
  };
  schema: FeatureSchema;
  readOnlyFields?: string[];
}
