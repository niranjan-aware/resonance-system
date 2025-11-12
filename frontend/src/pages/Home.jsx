import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Music, Video, Mic, Star, ArrowRight, Check } from 'lucide-react';
import Button from '../components/common/Button';
import { studiosList } from '../data/studios';

const Home = () => {
  const features = [
    {
      icon: <Music className="w-8 h-8" />,
      title: 'Professional Equipment',
      description: 'State-of-the-art audio equipment and instruments'
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: '4K Video Recording',
      description: 'True 4K quality video production services'
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: 'Expert Sound Engineers',
      description: 'Dedicated team for perfect sound quality'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Easy Online Booking',
      description: 'Book your studio session in minutes'
    }
  ];

  const benefits = [
    'Three unique studios for different needs',
    'Operating hours: 8:00 AM to 10:00 PM',
    'Professional sound equipment included',
    'Free parking available',
    'Climate controlled environment',
    'Experienced sound operators'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 text-white pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Professional Studio
                <br />
                <span className="text-accent-400">Recording & Rehearsal</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-secondary-100 max-w-2xl mx-auto">
                Premium recording studios in Pune with state-of-the-art equipment and professional sound engineers
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/booking">
                  <Button variant="accent" size="xl" className="w-full sm:w-auto">
                    <Calendar className="w-5 h-5" />
                    Book Studio Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/studios">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto !text-white !border-white hover:!bg-white/10">
                    View Studios
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success-400" />
                  <span>3 Professional Studios</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success-400" />
                  <span>Rates from ₹250/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success-400" />
                  <span>Book Online 24/7</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Why Choose Resonance?</h2>
            <p className="section-subtitle">
              Everything you need for the perfect recording or rehearsal session
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-large transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studios Preview */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Our Studios</h2>
            <p className="section-subtitle">
              Choose the perfect studio for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {studiosList.map((studio, index) => (
              <motion.div
                key={studio.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card overflow-hidden group"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white">
                  <Music className="w-20 h-20 opacity-50" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{studio.name}</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                    {studio.description.substring(0, 100)}...
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-accent-500" />
                      <span className="font-semibold capitalize">{studio.size} Studio</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                      <span>From ₹{Math.min(...Object.values(studio.pricing))}/hr</span>
                    </div>
                  </div>
                  <Link to={`/studios#${studio.id}`}>
                    <Button variant="outline" className="w-full group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/studios">
              <Button variant="primary" size="lg">
                View All Studios
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Professional Studio Experience
              </h2>
              <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
                After a decade of excellence, we're thrilled to offer top-tier audio-video recording services in addition to rehearsal services at our new state-of-the-art facility on Sinhgad Road, Pune.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success-600 dark:text-success-400" />
                    </div>
                    <span className="text-secondary-700 dark:text-secondary-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/about">
                  <Button variant="primary" size="lg">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                <Music className="w-64 h-64 text-white opacity-20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Book Your Studio Session?
            </h2>
            <p className="text-xl mb-8 text-secondary-100 max-w-2xl mx-auto">
              Choose your perfect studio, pick your time, and start creating amazing music today!
            </p>
            <Link to="/booking">
              <Button variant="accent" size="xl">
                <Calendar className="w-6 h-6" />
                Book Your Session Now
                <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;