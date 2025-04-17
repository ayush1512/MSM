
import React, { useState } from 'react';
import avatar from "assets/img/avatars/avatar4.png";
import banner from "assets/img/profile/banner.png";
import Card from "components/card";
import { MdModeEditOutline } from "react-icons/md";
import ProfileEdit from 'components/popup/ProfileEdit';
import { useUser } from 'context/UserContext';
import { motion } from 'framer-motion';

const Banner = (props) => {
  const { userInfo } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false); // State to control the popup visibility

  // Function to close the popup
  const closePhotoPopup = () => setIsPhotoPopupOpen(false);

  return (
    <Card extra={"items-center w-full h-full p-[16px] bg-cover relative"}>
      {/* ProfileEdit popup */}
      <ProfileEdit 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />
      
      {/* Edit Button - Theme-aware button with dark/light mode support */}
      <div className="absolute top-7 right-6 z-10">
        <motion.button
          onClick={() => setIsEditProfileOpen(true)}
          className="flex items-center justify-center gap-1 px-3 py-1 
            rounded-full transition-colors duration-200 
            border border-white bg-white/20 backdrop-blur-sm text-gray-900 hover:bg-white/0 
            dark:border-white/20 dark:bg-navy-800/30 dark:backdrop-blur-sm dark:text-white dark:hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MdModeEditOutline className="h-4 w-4" />
          <span className="font-medium text-sm">Edit</span>
        </motion.button>
      </div>
      
      {/* Background and profile */}
      <motion.div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700 cursor-pointer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onClick={() => setIsPhotoPopupOpen(true)} // Open the photo popup on click
        >
          <img className="h-full w-full rounded-full" src={userInfo?.image_data?.url || avatar} alt="User Avatar" />
        </motion.div>
      </motion.div>

      {/* Name and position */}
      <motion.div
        className="mt-16 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {userInfo.username}
        </h4>
        <p className="text-base font-normal text-gray-600">{userInfo?.shop_name || "No Name available"}</p>
      </motion.div>

      {/* Post followers */}
      <motion.div
        className="mt-6 mb-3 flex gap-4 md:!gap-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          className="flex flex-col items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <p className="text-2xl font-bold text-navy-700 dark:text-white">17</p>
          <p className="text-sm font-normal text-gray-600">Posts</p>
        </motion.div>
        <motion.div
          className="flex flex-col items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <p className="text-2xl font-bold text-navy-700 dark:text-white">9.7K</p>
          <p className="text-sm font-normal text-gray-600">Followers</p>
        </motion.div>
        <motion.div
          className="flex flex-col items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <p className="text-2xl font-bold text-navy-700 dark:text-white">434</p>
          <p className="text-sm font-normal text-gray-600">Following</p>
        </motion.div>
      </motion.div>

      {/* Photo Popup */}
      {isPhotoPopupOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closePhotoPopup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-4 rounded-lg max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()} // Prevent the popup from closing when clicking inside it
          >
            <img
              className="w-full h-auto rounded-lg"
              src={userInfo?.image_data?.url || avatar}
              alt="Profile Picture"
            />
            <div className="mt-4 text-center">
              <button
                onClick={closePhotoPopup}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Card>
  );
};

export default Banner;
