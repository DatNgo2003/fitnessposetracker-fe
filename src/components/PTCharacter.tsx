import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PTCharacterProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isConnected: boolean;
}

export const PTCharacter = ({ 
  isListening, 
  isSpeaking, 
  isProcessing, 
  isConnected 
}: PTCharacterProps) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  // Mouth animation sync with speaking state
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 200); // Quick mouth movement for speaking
      return () => clearInterval(interval);
    } else {
      setMouthOpen(false);
    }
  }, [isSpeaking]);

  // Breathing animation for idle state
  const breathingVariants = {
    idle: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    listening: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    speaking: {
      scale: [1, 1.08, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Lighting effects based on state
  const getLightingColor = () => {
    if (isSpeaking) return 'shadow-green-500/30';
    if (isListening) return 'shadow-purple-500/30';
    if (isProcessing) return 'shadow-blue-500/30';
    return 'shadow-gray-500/20';
  };

  return (
    <div className="relative w-64 h-80 mx-auto">
      {/* Background Lighting Effect */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-xl ${getLightingColor()}`}
        animate={{
          scale: isListening ? [1, 1.3, 1] : isSpeaking ? [1, 1.2, 1] : 1,
          opacity: isListening ? [0.3, 0.6, 0.3] : isSpeaking ? [0.4, 0.7, 0.4] : 0.2
        }}
        transition={{
          duration: isListening ? 1.5 : isSpeaking ? 0.8 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Character Container */}
      <motion.div
        className="relative w-full h-full"
        variants={breathingVariants}
        animate={
          isSpeaking ? "speaking" : 
          isListening ? "listening" : 
          "idle"
        }
      >
        {/* Character SVG */}
        <svg
          viewBox="0 0 200 280"
          className="w-full h-full drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
        >
          {/* Background Gradient */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#2d3748" />
            </linearGradient>
            <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a202c" />
              <stop offset="100%" stopColor="#2d3748" />
            </linearGradient>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbb6ce" />
              <stop offset="100%" stopColor="#f687b3" />
            </linearGradient>
            <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>
          </defs>

          {/* Body (Torso) */}
          <ellipse cx="100" cy="180" rx="45" ry="60" fill="url(#bodyGradient)" />
          
          {/* Shirt */}
          <path d="M 60 140 Q 100 130 140 140 L 140 200 Q 100 190 60 200 Z" fill="url(#shirtGradient)" />
          
          {/* Arms */}
          <ellipse cx="65" cy="160" rx="12" ry="25" fill="url(#skinGradient)" transform="rotate(-15 65 160)" />
          <ellipse cx="135" cy="160" rx="12" ry="25" fill="url(#skinGradient)" transform="rotate(15 135 160)" />
          
          {/* Legs */}
          <ellipse cx="85" cy="240" rx="15" ry="35" fill="url(#bodyGradient)" />
          <ellipse cx="115" cy="240" rx="15" ry="35" fill="url(#bodyGradient)" />
          
          {/* Head */}
          <circle cx="100" cy="80" r="35" fill="url(#skinGradient)" />
          
          {/* Hair */}
          <path d="M 70 60 Q 100 45 130 60 Q 125 80 100 75 Q 75 80 70 60 Z" fill="url(#hairGradient)" />
          
          {/* Eyes */}
          <circle cx="90" cy="75" r="4" fill="#1a202c" />
          <circle cx="110" cy="75" r="4" fill="#1a202c" />
          <circle cx="91" cy="74" r="1.5" fill="white" />
          <circle cx="111" cy="74" r="1.5" fill="white" />
          
          {/* Eyebrows */}
          <path d="M 85 70 Q 90 68 95 70" stroke="#1a202c" strokeWidth="2" fill="none" />
          <path d="M 105 70 Q 110 68 115 70" stroke="#1a202c" strokeWidth="2" fill="none" />
          
          {/* Nose */}
          <ellipse cx="100" cy="85" rx="2" ry="3" fill="#e2e8f0" />
          
          {/* Mouth - Animated */}
          <motion.ellipse
            cx="100"
            cy="95"
            rx={mouthOpen ? "8" : "4"}
            ry={mouthOpen ? "6" : "2"}
            fill="#1a202c"
            animate={{
              rx: mouthOpen ? 8 : 4,
              ry: mouthOpen ? 6 : 2
            }}
            transition={{
              duration: 0.1,
              ease: "easeInOut"
            }}
          />
          
          {/* Jawline */}
          <path d="M 70 100 Q 100 110 130 100" stroke="#f687b3" strokeWidth="1" fill="none" />
          
          {/* Chest definition */}
          <path d="M 85 150 Q 100 160 115 150" stroke="#4a5568" strokeWidth="1" fill="none" />
          
          {/* Shoulder definition */}
          <ellipse cx="75" cy="145" rx="8" ry="12" fill="#2d3748" />
          <ellipse cx="125" cy="145" rx="8" ry="12" fill="#2d3748" />
        </svg>

        {/* State-specific Effects */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
        
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.div>
    </div>
  );
};
