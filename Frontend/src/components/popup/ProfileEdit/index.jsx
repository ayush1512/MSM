import React, { useState, useEffect } from 'react';
import { X, Save, Upload, User, Mail, Phone, MapPin, Loader, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from 'context/UserContext';

export default function ProfileEdit({ isOpen, onClose }) {
  const { user, userInfo, updateUserInfo } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    image_data: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);

  // Initialize form with user data when opened
  useEffect(() => {
    if (isOpen && userInfo) {
      setFormData({
        username: userInfo.username || '',
        email: user || '',
        phone: userInfo.phone || '',
        image_data: userInfo.image_data || ''
      });
      setError('');
      setSuccess(false);
    }
  }, [isOpen, user, userInfo]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          image_data: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Only send data that has changed
      const updateData = {};
      if (formData.username !== userInfo?.username) updateData.username = formData.username;
      if (formData.phone !== userInfo?.phone) updateData.phone = formData.phone;
      if (formData.address !== userInfo?.address) updateData.address = formData.address;
      if (formData.image_data !== userInfo?.image_data) updateData.image_data = formData.image_data;

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const result = await updateUserInfo(updateData);
        
        if (result.success) {
          setSuccess(true);
          // Close the popup after short delay
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(result.error || 'Failed to update profile');
        }
      } else {
        // No changes to save
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[60]" // z-[60] ensures it's above navbar
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.div 
              className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-navy-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Edit Profile
                </h2>
                <motion.button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Body */}
              <div className="p-6 dark:text-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4"
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Profile Image */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-navy-600">
                            {formData.image_data ? (
                              <img 
                                src={formData.image_data} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-navy-700">
                                <User size={40} className="text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-brand-500 hover:bg-brand-600 text-white rounded-full p-2 shadow-md"
                          >
                            <Upload size={14} />
                          </button>
                          <input 
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Click the icon to upload a profile picture
                        </p>
                      </div>

                      {/* Form fields */}
                      <div className="space-y-4">
                        {/* Username */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                              placeholder="Your username"
                            />
                          </div>
                        </div>

                        {/* Email (readonly) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              readOnly
                              className="pl-10 w-full px-3 py-2 bg-gray-100 dark:bg-navy-800 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm dark:text-gray-400 cursor-not-allowed"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                              placeholder="Your phone number"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Error and Success Messages */}
                      {error && (
                        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="text-green-500 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center">
                          <CheckCircle size={16} className="mr-2" />
                          Profile updated successfully!
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-4 mt-2 w-full justify-center">
                        <motion.button
                          type="button"
                          onClick={onClose}
                          className="flex items-center gap-2 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-md shadow-gray-200/50 dark:shadow-brand-400/20 border border-gray-200 dark:border-opacity-0"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-500 text-white dark:text-gray-900 dark:hover:text-navy-900 px-4 py-2 rounded-full shadow-md shadow-gray-900/30 dark:shadow-green-600/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader size={18} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Save Changes
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
