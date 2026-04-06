/**
 * The Oracle Avatar Component
 * Displays avatar, name and introduction
 */
import React from 'react';
import './NaoNaiAvatar.css';

interface NaoNaiAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  className?: string;
}

export const NaoNaiAvatar: React.FC<NaoNaiAvatarProps> = ({
  size = 'medium',
  showTitle = true,
  className = '',
}) => {
  return (
    <div className={`naonai-avatar naonai-avatar-${size} ${className}`}>
      <div className="naonai-avatar-circle">
        <span className="naonai-avatar-emoji">👵🏻</span>
      </div>
      {showTitle && (
        <div className="naonai-avatar-info">
          <h2 className="naonai-avatar-name">Nǎi Nai</h2>
          <p className="naonai-avatar-title">BaZi Master · 60 Years Experience</p>
        </div>
      )}
    </div>
  );
};

export default NaoNaiAvatar;
