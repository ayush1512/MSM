import React, { useEffect, useState } from "react";

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const teamMembers = [
    {
      name: "Pallavi Phadke",
      role: "Partner",
      description: [
        "Founder and Partner",
        "M.Sc. (Electronic Science), Fergusson College, Pune",
        "Running the Company Operations for 4 years",
        "International Exposure with Cross-Industry Experience",
      ],
      image: "/public/ayush.jpg",
    },
    {
      name: "Devendra Phadke",
      role: "Chief Technology Officer (CTO)",
      description: [
        "M. Tech. (Electrical), IIT Kharagpur",
        "Worked as Vice President in Accenture and Wipro",
        "Experience of 20 years in IT",
        "Specialized in large-scale system designs and tech leadership",
      ],
      image: "/path-to-devendra-image.jpg",
    },
    {
      name: "John Doe",
      role: "Lead Developer",
      description: [
        "Expert in full-stack development with React and Node.js",
        "5+ years of experience in web and mobile applications",
        "Focused on delivering scalable solutions",
        "Mentors junior developers and promotes code quality",
      ],
      image: "/path-to-john-image.jpg",
    },
    {
      name: "Jane Smith",
      role: "UI/UX Designer",
      description: [
        "Specialized in creating user-friendly interfaces",
        "Proficient in Adobe XD, Figma, and Sketch",
        "Passionate about crafting modern and accessible designs",
        "Ensures seamless user experiences for all applications",
      ],
      image: "/path-to-jane-image.jpg",
    },
  ];

  const handleImageError = (e) => {
    e.target.src = "/fallback-image.jpg"; // Fallback image URL if the original image doesn't load
  };

  // Fade-in effect for the page
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`bg-gray-50 min-h-screen py-16 transition-opacity ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12 animate__animated animate__fadeIn">
          Meet Our Team
        </h1>

        {/* Flex Container with Hover Animations */}
        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/4 xl:w-1/5 transform hover:scale-105 transition-transform duration-500"
            >
              {/* Image without animation */}
              <img
                src={member.image}
                alt={member.name}
                onError={handleImageError}
                className="w-full h-64 object-cover"
              />
              {/* Content with fade-in animation */}
              <div className="p-6 flex flex-col justify-between flex-grow animate__animated animate__fadeIn animate__delay-1s">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {member.name}
                </h2>
                <p className="text-[#2C3E50] font-semibold mb-4">
                  {member.role}
                </p>
                <ul className="text-gray-600 text-sm list-disc list-inside space-y-2">
                  {member.description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section with Fade-in Animation */}
      <footer className="bg-[#2C3E50] text-white py-8 mt-12 opacity-0 animate__animated animate__fadeIn animate__delay-2s">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Company Name. All Rights Reserved.</p>
          <p className="text-sm mt-2">
            Designed and developed by Your Company. Proudly serving the web!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

