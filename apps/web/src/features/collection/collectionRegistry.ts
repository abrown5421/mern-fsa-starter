import { useCreateUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from "../../app/store/api/usersApi";

export interface CollectionConfig {
  feature: string;
  api: {
    useGetById: any;
    useCreate: any;
    useUpdate: any;
  };
  schema: {
    name: string;
    fields: {
      name: string;
      type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Array';
      required?: boolean;
      enum?: string[];
    }[];
  };
}

export const collectionRegistry: Record<string, CollectionConfig> = {
  user: {
    feature: 'user',
    api: {
      useGetById: useGetUserByIdQuery,
      useCreate: useCreateUserMutation,
      useUpdate: useUpdateUserMutation,
    },
    schema: {
      name: 'User',
      fields: [
        { name: 'firstName', type: 'String', required: true },
        { name: 'lastName', type: 'String', required: true },
        { name: 'email', type: 'String', required: true },
        { name: 'password', type: 'String', required: true }, 
        { name: 'type', type: 'String', required: true, enum: ['user', 'editor', 'admin'] },
        { name: 'profileImage', type: 'String' },
      ],
    },
  },
};
