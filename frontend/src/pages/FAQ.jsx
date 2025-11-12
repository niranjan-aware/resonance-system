import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqData } from '../data/faq';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Find answers to common questions about our studios and services
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqData.map((categoryData, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  {categoryData.category}
                </h2>
                
                <div className="space-y-4">
                  {categoryData.questions.map((item, index) => {
                    const key = `${categoryData.category}-${index}`;
                    const isOpen = openItems[key];

                    return (
                      <div key={index} className="card overflow-hidden">
                        <button
                          onClick={() => toggleItem(categoryData.category, index)}
                          className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                        >
                          <span className="font-semibold">{item.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        <motion.div
                          initial={false}
                          animate={{
                            height: isOpen ? 'auto' : 0,
                            opacity: isOpen ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 text-secondary-600 dark:text-secondary-400">
                            {item.answer}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-12"
          >
            <div className="card p-8 text-center bg-gradient-primary text-white">
              <h3 className="text-2xl font-bold mb-3">Still Have Questions?</h3>
              <p className="text-secondary-100 mb-6">
                Feel free to reach out to us directly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+919822029235" className="btn-accent">
                  Call Us Now
                </a>
                <a href="/contact" className="btn-secondary !text-white !border-white hover:!bg-white/10">
                  Contact Page
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;