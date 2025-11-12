import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const Gallery = () => {
  // Placeholder for images - will be replaced with actual images
  const galleryItems = [
    { id: 1, title: 'Studio A - Main View', type: 'studio-a' },
    { id: 2, title: 'Studio A - Equipment', type: 'studio-a' },
    { id: 3, title: 'Studio A - Karaoke Setup', type: 'studio-a' },
    { id: 4, title: 'Studio B - Overview', type: 'studio-b' },
    { id: 5, title: 'Studio B - Recording Session', type: 'studio-b' },
    { id: 6, title: 'Studio C - Podcast Setup', type: 'studio-c' },
    { id: 7, title: 'Studio C - Recording Booth', type: 'studio-c' },
    { id: 8, title: 'Control Room', type: 'equipment' },
    { id: 9, title: 'Drum Kit', type: 'equipment' },
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
              Gallery
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              Take a tour of our state-of-the-art studios and equipment
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="card overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center relative overflow-hidden">
                  <Music className="w-20 h-20 text-white opacity-20 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-center">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-secondary-600 dark:text-secondary-400">
              📸 Professional studio photos coming soon! Visit us to see our amazing facilities in person.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;