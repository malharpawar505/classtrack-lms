export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 } 
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.03)" },
  hover: { 
    y: -6, 
    scale: 1.01,
    boxShadow: "0px 20px 40px rgba(14, 165, 233, 0.12)", // sky blue shadow
    rotateX: 2,
    rotateY: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
};

export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 15 } },
  pressed: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 10 } },
};

export const floatingAnimation = {
  y: ["-6px", "6px"],
  transition: {
    y: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};
