import { getBasePath } from '@/utility/basePath';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface SvgIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icon = (props:SvgIconProps) => {
  const [basePath, setBasePath] = useState('');

  useEffect(() => {
    const fetchBasePath = async () => {
      try {
        const path = await window.electronAPI.getBasePath();
        setBasePath(path);
      } catch (error) {
        console.error('Error fetching base path:', error);
      }
    };

    fetchBasePath();
  }, []);

  return (
    basePath ? (
    <img
      className={`icon ${props.className || ''}`}
      width={props.size}
      height={props.size}
      src={`${basePath}/${props.name}.svg`}
    />) : (
      <div>Loading...</div>
    )
  );
};

export default Icon;
