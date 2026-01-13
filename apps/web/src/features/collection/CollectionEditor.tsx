import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery, useCreateUserMutation, useUpdateUserMutation } from '../../app/store/api/usersApi';
import Loader from '../loader/Loader';
import { useAppSelector } from '../../app/store/hooks';

type FeatureType = 'product' | 'user' | 'order';

interface CollectionEditorProps {
  id?: string;
  mode: 'edit' | 'create';
  featureType: FeatureType;
}

const CollectionEditor: React.FC<CollectionEditorProps> = ({ id, mode, featureType }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id || '', {
    skip: featureType !== 'user' || mode !== 'edit' || !id,
  });
  const [createUser, { isLoading: creatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: updatingUser }] = useUpdateUserMutation();

  const isLoading = userLoading;
  const isSaving = creatingUser || updatingUser;

  useEffect(() => {
    if (mode === 'edit') {
      if (featureType === 'user' && userData) {
        setFormData(userData);
      }
    } else {
      if (featureType === 'user') {
        setFormData({ firstName: '', lastName: '', email: '', password: '', type: 'user' });
      } 
    }
  }, [mode, featureType, userData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (featureType === 'user') {
      if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      if (mode === 'create' && !formData.password?.trim()) newErrors.password = 'Password is required';
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (featureType === 'user') {
        if (mode === 'create') {
          await createUser(formData).unwrap();
        } else if (id) {
          await updateUser({ id, data: formData }).unwrap();
        }
      }
      navigate(`/admin-${featureType}`);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleCancel = () => {
    navigate(`/admin-${featureType}`);
  };

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

        <div className="space-y-6 bg-neutral3 p-6 rounded-lg">
          {featureType === 'user' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-contrast mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full input-primary"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-contrast mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full input-primary"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full input-primary"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-contrast mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full input-primary"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">User Type</label>
                <select
                  value={formData.type || 'user'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={`w-full ${user?.type !== 'admin' ? "input-disabled" : "input-primary"}`}
                  disabled={user?.type !== 'admin'}
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-contrast mb-2">Profile Image URL</label>
                <input
                  type="text"
                  value={formData.profileImage || ''}
                  onChange={(e) => handleChange('profileImage', e.target.value)}
                  className="w-full input-primary"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="btn-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CollectionEditor;