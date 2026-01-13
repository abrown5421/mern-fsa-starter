import { motion } from 'framer-motion';
import { useDeleteUserMutation, useGetUsersQuery } from '../../app/store/api/usersApi';
import Loader from '../../features/loader/Loader';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/hooks';
import { IUser } from '../../types/user.types';
import { openModal } from '../../features/modal/modalSlice';
import CollectionEditor from '../../features/collection/CollectionEditor';
import CollectionViewer from '../../features/collection/CollectionViewer';

const AdminUser = () => {
  const dispatch = useAppDispatch();
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const { id } = useParams();
  const isNew = location.pathname.endsWith('/new');

  if (isLoading) return <Loader />;

  const handleDelete = (item: IUser) => {
    dispatch(
      openModal({
        modalContent: 'confirm',
        title: 'Delete User',
        message: 'This action is permanent and cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmAction: async () => {
          try {
            await deleteUser(item._id).unwrap();
          } catch (err) {
            console.error('Delete failed', err);
          }
        },
      })
    );
  };

  if (isNew) {
    return <CollectionEditor mode="create" featureType="user" />;
  }

  if (id) {
    return <CollectionEditor mode="edit" id={id} featureType="user" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral relative z-0 p-4 flex flex-8 sup-min-nav "
    >
      <CollectionViewer
        featureName='user'
        data={users}
        searchKeys={['firstName', 'lastName', 'email']}
        columns={[
          { key: 'firstName', label: 'First Name', hideOnSmall: true },
          { key: 'lastName', label: 'Last Name', hideOnSmall: true },
          { key: 'email', label: 'Email' },
          { key: 'type', label: 'Role' },
          { key: 'createdAt', label: 'Created', render: (u) => new Date(u.createdAt).toLocaleDateString(), hideOnSmall: true },
        ]}
        onEdit={(user) => console.log('Edit', user)}
        onDelete={(user) => handleDelete(user)}
      />
    </motion.div>
  );
};

export default AdminUser;
