import { motion } from 'framer-motion';
import { useAppDispatch } from '../../app/store/hooks';
import { openDrawer } from '../../features/drawer/drawerSlice';

const Home = () => {
  const dispatch = useAppDispatch();
  const handleClick = () => {
    dispatch(openDrawer({
      open: true,
      drawerContent: 'navbar',
      anchor: 'right',
      title: 'Hello!'
   }))
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
