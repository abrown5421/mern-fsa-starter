import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Loader from '../loader/Loader';
import { useAppSelector } from '../../app/store/hooks';
import { collectionRegistry } from './collectionRegistry';
import { CollectionConfig } from './types';

interface CollectionEditorProps {
  id?: string;
  mode: 'edit' | 'create';
  featureType: string;
}

const CollectionEditor: React.FC<CollectionEditorProps> = ({ id, mode, featureType }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const collectionConfig: CollectionConfig | undefined = collectionRegistry[featureType];
  const readOnlyFields: string[] = collectionConfig.readOnlyFields || [];

  if (!collectionConfig) {
    return (
    <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-neutral relative z-0 p-4 flex flex-8 sup-min-nav text-red-500"
        >
          Collection "{featureType}" is not registered.
    </motion.div>);
  }

  const { api, schema } = collectionConfig;

  const { data: itemData, isLoading: loadingItem } = api.useGetById(id || '', {
    skip: mode !== 'edit' || !id,
  });
  const [createItem, { isLoading: creating }] = api.useCreate();
  const [updateItem, { isLoading: updating }] = api.useUpdate();

  const isLoading = loadingItem;
  const isSaving = creating || updating;

  useEffect(() => {
    if (mode === 'edit' && itemData) {
      setFormData(itemData);
    } else if (mode === 'create') {
      const initialData: any = {};
      schema.fields.forEach((f) => {
        initialData[f.name] = '';
      });
      setFormData(initialData);
    }
  }, [mode, itemData, schema.fields]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    schema.fields.forEach((f) => {
      if (f.required && !formData[f.name]?.toString().trim()) {
        newErrors[f.name] = `${f.name.charAt(0).toUpperCase() + f.name.slice(1)} is required`;
      }
      if (f.enum && !f.enum.includes(formData[f.name])) {
        newErrors[f.name] = `Invalid value for ${f.name}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'create') {
        await createItem(formData).unwrap();
      } else if (id) {
        await updateItem({ id, data: formData }).unwrap();
      }
      navigate(`/admin-${featureType}`);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleCancel = () => navigate(`/admin-${featureType}`);

  if (isLoading) return <Loader />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral relative z-0 p-6 flex flex-col flex-8 overflow-y-auto"
    >
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-neutral-contrast font-primary mb-6">
          {mode === 'create' ? 'Create' : 'Edit'} {featureType.charAt(0).toUpperCase() + featureType.slice(1)}
        </h1>

        <form className="space-y-6 bg-neutral3 p-6 rounded-lg" onSubmit={handleSubmit}>
          {schema.fields.map((field) => {
            const isDisabled = 
              readOnlyFields.includes(field.name) || 
              (field.name === 'type' && user?.type !== 'admin');
            const commonProps = {
              value: formData[field.name] || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                handleChange(field.name, e.target.value),
              className: `w-full ${isDisabled ? 'input-disabled' : 'input-primary'}`,
              disabled: isDisabled,
            };

            if (field.type === "Array" && Array.isArray(formData[field.name])) {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-neutral-contrast mb-2">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </label>

                  <ul className="pl-5 list-disc text-neutral-contrast">
                    {formData[field.name].map((item: any, index: number) => (
                      <li key={index}>{item?.toString()}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            if (field.enum) {
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-neutral-contrast mb-2">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </label>
                  <select
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full ${isDisabled ? "input-disabled" : "input-primary"}`}
                    disabled={isDisabled}
                  >
                    {field.enum.map((val) => (
                      <option key={val} value={val}>
                        {val.charAt(0).toUpperCase() + val.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
                </div>
              );
            }

            let inputType: string = "text";
            if (field.type === "Number") inputType = "number";
            else if (field.type === "Boolean") inputType = "checkbox";
            else if (field.name.toLowerCase().includes("password")) inputType = "password";
            else if (field.name.toLowerCase().includes("email")) inputType = "email";

            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">
                  {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  {field.required && " *"}
                </label>
                {inputType === "checkbox" ? (
                  <div className="flex items-center mb-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        disabled={isDisabled}
                        className="sr-only"
                      />
                      <div
                        className={`w-11 h-6 bg-gray-200 rounded-full transition-all ${
                          formData[field.name] ? 'bg-primary' : ''
                        }`}
                      ></div>
                      <div
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          formData[field.name] ? 'translate-x-5' : ''
                        }`}
                      ></div>
                    </label>
                  </div>
                ) : (
                  <input
                    type={inputType}
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full ${isDisabled ? "input-disabled" : "input-primary"}`}
                    disabled={isDisabled}
                  />
                )}
                {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
              </div>
            );
          })}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleCancel} className="btn-gray">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CollectionEditor;
