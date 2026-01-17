import { motion } from 'framer-motion';
import { TrianglifyBanner } from '../../features/trianglify/TrianglifyBanner';
import { TrianglifyConfig } from '../../features/trianglify/types';
import { generateRandomTrianglifyBanner } from '../../features/trianglify/generateRandomTrianglifyBanner';
import { useState } from 'react';

const Home = () => {
  const [config, setConfig] = useState<TrianglifyConfig>(generateRandomTrianglifyBanner());
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral sup-min-nav relative z-0 p-4"
    >
      <TrianglifyBanner width={800} height={400} config={config} />
    </motion.div>
  );
};

export default Home;
