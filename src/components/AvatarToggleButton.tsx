/**
 * AvatarToggleButton Component
 * Floating button to toggle PT Avatar visibility
 */

import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface AvatarToggleButtonProps {
  isAvatarVisible: boolean;
  onToggle: () => void;
}

const AvatarToggleButton: React.FC<AvatarToggleButtonProps> = ({
  isAvatarVisible,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed bottom-6 right-6 z-40
        w-16 h-16 rounded-full shadow-2xl
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        ${
          isAvatarVisible
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        }
      `}
      title={isAvatarVisible ? 'Ẩn Avatar PT' : 'Hiện Avatar PT'}
    >
      {isAvatarVisible ? (
        <X size={28} className="text-white" />
      ) : (
        <MessageCircle size={28} className="text-white animate-pulse" />
      )}
      
      {/* Ripple effect when not visible */}
      {!isAvatarVisible && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>
      )}
    </button>
  );
};

export default AvatarToggleButton;
