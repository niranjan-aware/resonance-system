import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { rateCardData } from '../data/rates';

const RateCard = () => {
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
              Rate Card
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Transparent pricing for all our services
            </p>
          </motion.div>
        </div>
      </section>

      {/* Studio Rates */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {Object.values(rateCardData).filter(item => item.rates).map((studio, index) => (
              <motion.div
                key={studio.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">{studio.name}</h3>
                <div className="space-y-3">
                  {studio.rates.map((rate, idx) => (
                    <div key={idx} className="flex justify-between items-start py-3 border-b border-secondary-200 dark:border-secondary-700 last:border-0">
                      <span className="text-sm text-secondary-700 dark:text-secondary-300 flex-1">
                        {rate.service}
                      </span>
                      <span className="font-bold text-primary-600 ml-4">
                        ₹{rate.price}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Special Packages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Special Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rateCardData.specialPackages.map((pkg, index) => (
                <div key={index} className="card p-6">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                    {pkg.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Studio A:</span>
                      <span className="font-bold">₹{pkg.studioA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Studio B:</span>
                      <span className="font-bold">₹{pkg.studioB}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Studio C:</span>
                      <span className="font-bold">₹{pkg.studioC}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Other Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Recording & Production Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rateCardData.otherServices.map((service, index) => (
                <div key={index} className="card p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold">{service.service}</h3>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{service.price}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="card p-6 bg-secondary-50 dark:bg-secondary-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm text-secondary-700 dark:text-secondary-300">
                  <p className="font-semibold">Important Notes:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>All prices are per hour unless specified otherwise</li>
                    <li>GST charges may apply</li>
                    <li>No advance payment required - pay at studio after session</li>
                    <li>Free cancellation with 24+ hours notice</li>
                    <li>Additional services like snacks, internet available at extra cost</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default RateCard;