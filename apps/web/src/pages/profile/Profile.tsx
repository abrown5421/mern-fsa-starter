import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { openAlert } from '../../features/alert/alertSlice';

const Profile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-neutral minus-nav relative z-0 p-4"
    >
      Profile
    </motion.div>
  );
};

export default Profile;
