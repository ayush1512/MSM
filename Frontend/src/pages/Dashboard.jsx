
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Stethoscope, TrendingUp, ScrollText, Phone, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from 'components/card';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ScrollText className="h-8 w-8 text-brand-500" />,
      title: "Prescription Scanner",
      description: "Instantly digitize and process prescriptions with our AI-powered scanner.",
      link: "/prescription-reader",
    },
    {
      icon: <Pill className="h-8 w-8 text-brand-500" />,
      title: "Medicine Catalog",
      description: "Browse our extensive collection of medicines and healthcare products.",
      link: "/product-scanner",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-500" />,
      title: "Inventory Management",
      description: "Real-time stock tracking and intelligent reordering system.",
      link: "/admin/stock",
    },
  ];

  const stats = [
    { icon: <Pill />, value: "10,000+", label: "Products" },
    { icon: <Users />, value: "50,000+", label: "Happy Customers" },
    { icon: <Stethoscope />, value: "1,000+", label: "Healthcare Partners" },
  ];

  const floatVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.17, 0.67, 0.83, 0.67] },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Intro Video Section */}
      <section className="relative w-full h-screen overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/intro-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to Medical Shop Management
          </motion.h1>
          <motion.p
            className="text-lg text-gray-200 mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Revolutionizing pharmacy operations with digital solutions.
          </motion.p>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <button
              onClick={() => navigate('/prescription-reader')}
              className="px-6 py-3 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/product-scanner')}
              className="px-6 py-3 bg-gray-100 text-navy-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold text-navy-700 dark:text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Explore Our Features
            </motion.h2>
            <motion.p
              className="text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tailored solutions for modern healthcare management.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={floatVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => navigate(feature.link)}
              >
                <Card extra="p-6 hover:shadow-xl transition-transform">
                  <motion.div
                    className="mb-4"
                    initial={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <Card extra="p-6">
                  <div className="flex justify-center mb-4 text-brand-500">
                    {stat.icon}
                  </div>
                  <h4 className="text-3xl font-bold text-navy-700 dark:text-white mb-2">
                    {stat.value}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container mx-auto px-4">
          <Card extra="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
                  Need Assistance?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our support team is here to help you 24/7
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/contact-us')}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors"
                >
                  <Phone size={20} />
                  Contact Us
                </button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer Section */}
      <motion.footer
        className="py-8 bg-gray-900 text-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">About Us</h4>
              <p className="text-gray-400">
                Modern Healthcare revolutionizes pharmacy operations with state-of-the-art digital solutions. Our mission is to improve access and efficiency in healthcare management.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/prescription-reader')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Prescription Reader
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/product-scanner')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Medicine Catalog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/admin/stock')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Inventory Management
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">
                1234 Healthcare Drive, Cityville, State 56789
              </p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
              <p className="text-gray-400">Email: support@modernhealthcare.com</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-4 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} Modern Healthcare. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Dashboard;
