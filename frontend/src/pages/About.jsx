import { motion } from 'framer-motion';
import { Music, Award, Users, Heart } from 'lucide-react';
import { teamInfo } from '../data/content';

const About = () => {
  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Over a decade of commitment to providing top-tier audio-video services'
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: 'Quality',
      description: 'State-of-the-art equipment and professional sound engineers'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Building a vibrant community of musicians and artists in Pune'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion',
      description: 'Dedicated to bringing your creative projects to life'
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
              About Resonance
            </h1>
            <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
              A decade of excellence in audio-video recording and rehearsal services
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-8 md:p-12"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-lg text-secondary-600 dark:text-secondary-400 leading-relaxed">
                <p>
                  After a decade of excellence in the audio industry, we're thrilled to expand our offerings and provide 
                  top-tier audio-video recording services in addition to rehearsal services at our new state-of-the-art 
                  facility on Sinhgad Road, Pune.
                </p>
                <p>
                  With our brand-new mixers, microphones, and entirely new setup, along with a dedicated team of 
                  audio-video recordists, we're committed to delivering exceptional results and bringing your creative 
                  projects to life.
                </p>
                <p>
                  Our facility features three unique studios - Studio A, Studio B, and Studio C - each equipped to cater 
                  to diverse musical, rehearsal, and recording needs.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center text-white mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                      Proprietor
                    </h3>
                    <p className="font-medium">{teamInfo.proprietor}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                      Investor
                    </h3>
                    <p className="font-medium">{teamInfo.investor}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <h3 className="font-semibold mb-4">Management Team</h3>
                <div className="space-y-3">
                  {teamInfo.management.map((member, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b border-secondary-200 dark:border-secondary-700 last:border-0">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        {member.role}
                      </span>
                      <span className="text-sm font-medium text-right">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <h3 className="font-semibold mb-4">Partners & Consultants</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Acoustic Consultant</span>
                    <span className="font-medium">{teamInfo.acousticConsultant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Contractor</span>
                    <span className="font-medium">{teamInfo.contractor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Electrical Contractor</span>
                    <span className="font-medium">{teamInfo.electricalContractor}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-6 bg-primary-50 dark:bg-primary-900/20"
              >
                <p className="text-center">
                  <span className="text-secondary-600 dark:text-secondary-400">Concept, Project Planning & Execution by </span>
                  <span className="font-bold text-primary-600">{teamInfo.conceptAndExecution}</span>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;