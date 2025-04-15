import React from "react";

export const Badge = ({ children, className, ...rest }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
