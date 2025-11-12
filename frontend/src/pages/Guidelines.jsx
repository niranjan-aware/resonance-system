import { motion } from 'framer-motion';
import { Clock, Car, Volume2, Cigarette, Info } from 'lucide-react';
import { guidelines } from '../data/content';

const Guidelines = () => {
  const guidelineItems = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: guidelines.operatingHours.title,
      content: guidelines.operatingHours.content,
      color: 'from-primary-600 to-primary-700'
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: guidelines.parking.title,
      content: guidelines.parking.content,
      color: 'from-success-600 to-success-700'
    },
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: guidelines.noise.title,
      content: guidelines.noise.content,
      color: 'from-accent-600 to-accent-700'
    },
    {
      icon: <Cigarette className="w-8 h-8" />,
      title: guidelines.smoking.title,
      content: guidelines.smoking.content,
      color: 'from-error-600 to-error-700'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Guidelines
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Please follow these guidelines for a smooth and respectful experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-8">
            {guidelineItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Privacy Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-12"
          >
            <div className="card p-6 bg-secondary-50 dark:bg-secondary-800">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Privacy & Monitoring</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                    To ensure your privacy, after the initial setup, our sound engineer/operator is advised to monitor externally. 
                    However, they will conduct intermittent checks inside the studio to confirm all systems are functioning properly. 
                    Should you require any assistance (e.g., an additional microphone, battery replacement, or any other technical support), 
                    please call them and they will promptly attend to your needs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Guidelines;