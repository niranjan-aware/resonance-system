import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { contactInfo } from '../data/content';
import Button from '../components/common/Button';

const Contact = () => {
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
              Contact Us
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Get in touch with us for bookings, queries, or just to say hello
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Map */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>

              <div className="space-y-6">
                {/* Address */}
                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        {contactInfo.address.line1}
                        <br />
                        {contactInfo.address.line2}
                        <br />
                        {contactInfo.address.city} - {contactInfo.address.pincode}
                        <br />
                        <span className="text-sm">
                          ({contactInfo.address.landmark})
                        </span>
                      </p>

                      <a
                        href={contactInfo.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3"
                      >
                        <Button variant="outline" size="sm">
                          Open in Maps
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-success-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-3">Phone Numbers</h3>
                      <div className="space-y-2">
                        {contactInfo.phone.map((contact, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm text-secondary-600 dark:text-secondary-400">
                              {contact.name}
                            </span>
                            <a
                              href={`tel:${contact.number}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              {contact.number}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Email</h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Operating Hours</h3>
                      <p className="text-secondary-600 dark:text-secondary-400">
                        Monday - Sunday
                        <br />
                        8:00 AM - 10:00 PM
                      </p>
                      <p className="text-sm text-secondary-500 mt-2">
                        Outside hours available on request
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="sticky top-24">
                <h2 className="text-3xl font-bold mb-8">Find Us</h2>
                <div className="card overflow-hidden aspect-square">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.5!2d73.8!3d18.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMwJzAwLjAiTiA3M8KwNDgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Resonance Studio Location"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
