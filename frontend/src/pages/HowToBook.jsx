import { motion } from 'framer-motion';
import { Calendar, Search, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const HowToBook = () => {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Choose Your Studio',
      description: 'Browse our three studios and select the one that best fits your needs based on size, equipment, and pricing.',
      color: 'from-primary-600 to-primary-700'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Pick Date & Time',
      description: 'Check availability on our calendar and select your preferred date and time slot. Book from tomorrow up to 4 months in advance.',
      color: 'from-accent-600 to-accent-700'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Fill Booking Details',
      description: 'Provide your name, phone number, session type, and any special requirements. No advance payment needed!',
      color: 'from-success-600 to-success-700'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Get Confirmation',
      description: 'Receive instant confirmation via WhatsApp with all booking details. We\'ll send reminders before your session.',
      color: 'from-secondary-600 to-secondary-700'
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
              How to Book
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Booking your studio session is quick and easy - just 4 simple steps!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[52px] top-24 w-0.5 h-24 bg-gradient-to-b from-secondary-300 to-transparent dark:from-secondary-700" />
                )}

                <div className="flex gap-6 mb-12">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl font-bold text-secondary-300 dark:text-secondary-700">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-400 text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Important Information</h2>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-2">📱 No Advance Payment</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Pay after your session at the studio via cash or UPI. No online payment required during booking.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-2">🔔 Reminders</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  You'll receive WhatsApp reminders 12 hours, 6 hours, and 3 hours before your session.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-2">❌ Cancellation Policy</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Free cancellation with 24+ hours notice. Less than 24 hours: ₹100 fee. No-show: ₹200 penalty.
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-2">⏰ Operating Hours</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  8:00 AM - 10:00 PM daily. Outside hours available on request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Book Your Session?
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8 max-w-2xl mx-auto">
            Get started now and secure your preferred time slot
          </p>
          <Link to="/booking">
            <Button variant="primary" size="xl">
              <Calendar className="w-6 h-6" />
              Book Now
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowToBook;