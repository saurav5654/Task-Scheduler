
import { TaskScheduler } from "@/components/TaskScheduler";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-100 dark:from-gray-900 dark:to-violet-950 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold tracking-tight mt-8 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300">
              Task Scheduler
            </h1>
          </motion.div>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Plan your day, organize your tomorrow
          </motion.p>
        </motion.header>
        
        <TaskScheduler />
      </div>
    </div>
  );
};

export default Index;
