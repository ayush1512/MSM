import React from "react";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4 mt-16">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-gray-50">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
          <p className="text-gray-600">We'd love to hear from you</p>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="John"
                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Doe"
                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              name="message"
              rows="3"
              maxLength="500"
    style={{ resize: 'none' }}  
              placeholder="Your message here..."
              className="w-full px-3 py-2 rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#2C3E50] hover:bg-[#34495E] text-white font-medium rounded shadow hover:shadow-lg transition-all duration-200"
          >
            Send Message
          </button>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
          <a href="tel:+15551234567" className="group hover:text-blue-600 transition-colors duration-200">
            <div className="flex items-center justify-center w-10 h-10 mx-auto bg-blue-100 rounded-full group-hover:bg-blue-200">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="block mt-2 font-medium">+1 (555) 123-4567</span>
          </a>

          <a href="mailto:support@example.com" className="group hover:text-blue-600 transition-colors duration-200">
            <div className="flex items-center justify-center w-10 h-10 mx-auto bg-blue-100 rounded-full group-hover:bg-blue-200">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="block mt-2 font-medium">support@example.com</span>
          </a>

          <a href="https://maps.google.com/?q=123+Business+Street" target="_blank" rel="noopener noreferrer" className="group hover:text-blue-600 transition-colors duration-200">
            <div className="flex items-center justify-center w-10 h-10 mx-auto bg-blue-100 rounded-full group-hover:bg-blue-200">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="block mt-2 font-medium">Find Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;