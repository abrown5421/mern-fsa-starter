import { motion } from 'framer-motion';
import { useAppDispatch } from '../../app/store/hooks';
import { openDrawer } from '../../features/drawer/drawerSlice';
import { openModal } from '../../features/modal/modalSlice';

const Home = () => {
  const dispatch = useAppDispatch();
  const handleClick = () => {
    dispatch(openModal({
      open: true, 
      modalContent: 'confirm',
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      confirmAction: () => console.log('User confirmed!'),
      cancelAction: () => console.log('User canceled!'),
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-neutral minus-nav relative z-0 p-4"
    >
      <button onClick={handleClick}>click here</button>
    </motion.div>
  );
};

export default Home;
