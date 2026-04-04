/**
 * Nǎi Nai 头像组件
 * 显示奶奶的头像、名字和介绍
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
          <p className="naonai-avatar-title">八字命理师 · 60年经验</p>
        </div>
      )}
    </div>
  );
};

export default NaoNaiAvatar;
