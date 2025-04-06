import React from 'react';
import { X } from 'lucide-react';

export default function Prescription(){
    return(
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm'>
            <div>
                <button><X/></button>
                
            </div>
        </div>
    )
}