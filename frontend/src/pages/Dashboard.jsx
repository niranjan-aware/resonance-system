import { motion } from 'framer-motion';
import { Calendar, Music } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              My Bookings
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              View and manage your studio bookings
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="card p-12 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Dashboard Coming Soon!</h2>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                Your booking dashboard will be available in Stage 6.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;