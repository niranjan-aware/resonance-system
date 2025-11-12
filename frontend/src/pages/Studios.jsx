import { motion } from 'framer-motion';
import { Users, Music, Tv, Star, CheckCircle } from 'lucide-react';
import { studiosList } from '../data/studios';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const Studios = () => {
  const sizeColors = {
    small: 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400',
    large: 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
  };

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
              Our Studios
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Three unique studios equipped to cater to diverse musical, rehearsal, and recording needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Studios List */}
      <section className="py-16">
        <div className="container-custom">
          <div className="space-y-16">
            {studiosList.map((studio, index) => (
              <motion.div
                key={studio.id}
                id={studio.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Section */}
                  <div className="aspect-video lg:aspect-square bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                    <Music className="w-32 h-32 text-white opacity-20" />
                  </div>

                  {/* Content Section */}
                  <div className="p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{studio.name}</h2>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${sizeColors[studio.size]}`}>
                          {studio.size} Studio
                        </span>
                      </div>
                    </div>

                    <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                      {studio.description}
                    </p>

                    {/* Capacity */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-semibold">Capacity</p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Live: {studio.capacity.live} | Karaoke: {studio.capacity.karaoke}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-accent-600" />
                        Key Features
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {studio.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                            <span className="text-secondary-700 dark:text-secondary-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing */}
                    <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 mb-6">
                      <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-2">
                        Starting from
                      </p>
                      <p className="text-3xl font-bold text-primary-600">
                        ₹{Math.min(...Object.values(studio.pricing))}
                        <span className="text-lg text-secondary-600 dark:text-secondary-400">/hour</span>
                      </p>
                    </div>

                    {/* CTA */}
                    <Link to="/booking">
                      <Button variant="primary" size="lg" className="w-full">
                        Book {studio.name}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Not Sure Which Studio to Choose?
          </h2>
          <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
            Contact us and we'll help you find the perfect studio for your needs
          </p>
          <Link to="/contact">
            <Button variant="accent" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Studios;