import React, { useState } from 'react';
import avatar from "assets/img/avatars/avatar4.png";
import banner from "assets/img/profile/banner.png";
import Card from "components/card";
import { MdModeEditOutline } from "react-icons/md";
import ProfileEdit from 'components/popup/ProfileEdit';
import { useUser } from 'context/UserContext';

const Banner = (props) => {
  const { userInfo } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  return (
    <Card extra={"items-center w-full h-full p-[16px] bg-cover relative"}>
      {/* ProfileEdit popup */}
      <ProfileEdit 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />
      
      {/* Edit Button - Theme-aware button with dark/light mode support */}
      <div className="absolute top-7 right-6 z-10">
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="flex items-center justify-center gap-1 px-3 py-1 
          rounded-full transition-colors duration-200
          border border-white bg-white/20 backdrop-blur-sm text-gray-900 hover:bg-white/0
          dark:border-white/20 dark:bg-navy-800/30 dark:backdrop-blur-sm dark:text-white dark:hover:bg-white/10">
          <MdModeEditOutline className="h-4 w-4" />
          <span className="font-medium text-sm">Edit</span>
        </button>
      </div>
      
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <img className="h-full w-full rounded-full" src={userInfo?.image_data?.url || avatar} alt="" />
        </div>
      </div>

      {/* Name and position */}
      <div className="mt-16 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          {userInfo.username}
        </h4>
        <p className="text-base font-normal text-gray-600">{userInfo?.shop_name || "No Name avlable"}</p>
      </div>

      {/* Post followers */}
      <div className="mt-6 mb-3 flex gap-4 md:!gap-14">
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">17</p>
          <p className="text-sm font-normal text-gray-600">Posts</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">
            9.7K
          </p>
          <p className="text-sm font-normal text-gray-600">Followers</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-navy-700 dark:text-white">
            434
          </p>
          <p className="text-sm font-normal text-gray-600">Following</p>
        </div>
      </div>
    </Card>
  );
};

export default Banner;
