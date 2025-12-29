import { motion } from 'framer-motion';

const Auth = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-neutral"
    >
      Auth Page
    </motion.div>
  );
};

export default Auth;
