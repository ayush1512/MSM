import React from "react";

const WorldMap = ({ countries }) => {
  // This is a simplified SVG world map component
  // In a real implementation, you might want to use a library like react-simple-maps
  return (
    <div className="w-full h-[140px] relative bg-white dark:bg-navy-900 rounded overflow-hidden">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full opacity-70 dark:opacity-50"
      >
        <path
          d="M473,131 L483,130 L491,135 L498,132 L506,135 L506,143 L514,148 L516,160 L511,167 L502,171 L496,178 L488,177 L485,182 L494,192 L496,201 L492,210 L488,210 L481,203 L476,209 L474,201 L467,198 L464,190 L459,186 L451,188 L445,195 L438,196 L433,192 L425,194 L425,183 L420,178 L416,171 L417,158 L419,150 L435,138 L445,132 L452,125 L461,126 L473,131"
          fill={countries.includes("Russia") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
        {/* USA */}
        <path
          d="M140,185 L175,185 L210,175 L230,155 L245,145 L275,145 L275,165 L270,175 L255,185 L250,195 L240,205 L225,210 L205,210 L190,215 L180,225 L165,225 L155,215 L140,205 L135,195 L140,185"
          fill={countries.includes("USA") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
        {/* India */}
        <path
          d="M600,255 L620,245 L635,245 L645,250 L655,260 L655,280 L645,290 L635,290 L620,285 L610,275 L605,265 L600,255"
          fill={countries.includes("India") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
        {/* China */}
        <path
          d="M650,220 L680,210 L700,210 L720,220 L725,230 L725,245 L715,255 L700,255 L680,250 L665,240 L650,230 L650,220"
          fill={countries.includes("China") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
        {/* Brazil */}
        <path
          d="M300,330 L330,310 L350,310 L360,320 L360,340 L350,360 L330,370 L310,370 L300,360 L290,340 L300,330"
          fill={countries.includes("Brazil") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
        {/* UK */}
        <path
          d="M425,160 L435,153 L445,153 L445,163 L435,170 L425,170 L425,160"
          fill={countries.includes("UK") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
        {/* Australia */}
        <path
          d="M720,400 L750,380 L780,380 L790,390 L790,410 L780,420 L750,420 L730,410 L720,400"
          fill={countries.includes("Australia") ? "#14B8A6" : "#E5E7EB"}
          stroke="#9CA3AF"
          strokeWidth="1"
        ></path>
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 p-1 flex items-center text-xs text-gray-500">
        <div className="w-2 h-2 bg-brand-500 mr-1 rounded-sm"></div>
        <span>Active Markets</span>
      </div>
    </div>
  );
};

export default WorldMap;
