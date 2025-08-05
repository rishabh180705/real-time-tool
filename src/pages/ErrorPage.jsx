import React, { useState, useEffect, useRef } from 'react';

export default function Error404Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const particlesRef = useRef(null);
  const floatingElementsRef = useRef([]);

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const particles = [];
      const numberOfParticles = 50;
      
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 15,
          animationDuration: Math.random() * 10 + 10,
        });
      }
      return particles;
    };

    const particles = createParticles();
    if (particlesRef.current) {
      particlesRef.current.innerHTML = '';
      particles.forEach(particle => {
        const span = document.createElement('span');
        span.className = 'particle';
        span.style.left = particle.left + '%';
        span.style.animationDelay = particle.animationDelay + 's';
        span.style.animationDuration = particle.animationDuration + 's';
        particlesRef.current.appendChild(span);
      });
    }
  }, []);

  // Mouse interaction effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      floatingElementsRef.current.forEach((element, index) => {
        if (element) {
          const speed = (index + 1) * 0.5;
          const x = (mouseX - 0.5) * speed * 20;
          const y = (mouseY - 0.5) * speed * 20;
          
          element.style.transform = `translate(${x}px, ${y}px)`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Searching for: "${searchQuery}"\n\nIn a real application, this would redirect to search results.`);
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const createRipple = (e, element) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleButtonClick = (e, action) => {
    createRipple(e, e.currentTarget);
    setTimeout(() => {
      if (action === 'home') {
        window.location.href = '/';
      } else if (action === 'back') {
        window.history.back();
      }
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <style jsx global>{`
        @keyframes float {
          0% {
            opacity: 0;
            transform: translateY(100vh) scale(0);
          }
          5% {
            opacity: 1;
            transform: translateY(90vh) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(-10vh) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-10vh) scale(0);
          }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatAround {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          50% { transform: translate(-20px, -60px) rotate(180deg); }
          75% { transform: translate(-50px, -30px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .particle {
          position: absolute;
          display: block;
          pointer-events: none;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float 15s infinite linear;
        }

        .error-code {
          font-size: 12rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(45deg, #ff6b6b, #feca57, #48cae4, #ff6b6b);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }

        .error-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          opacity: 0;
          animation: slideUp 1s ease-out 0.5s forwards;
        }

        .error-message {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          line-height: 1.6;
          opacity: 0;
          animation: slideUp 1s ease-out 1s forwards;
        }

        .search-container {
          margin-bottom: 2rem;
          opacity: 0;
          animation: slideUp 1s ease-out 1.5s forwards;
        }

        .buttons {
          opacity: 0;
          animation: slideUp 1s ease-out 2s forwards;
        }

        .floating-element {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: floatAround 20s infinite linear;
          pointer-events: none;
        }

        .floating-element:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-duration: 25s;
          width: 80px;
          height: 80px;
        }

        .floating-element:nth-child(2) {
          top: 60%;
          right: 15%;
          animation-duration: 30s;
          animation-direction: reverse;
        }

        .floating-element:nth-child(3) {
          bottom: 20%;
          left: 20%;
          animation-duration: 35s;
          width: 40px;
          height: 40px;
        }

        @media (max-width: 768px) {
          .error-code {
            font-size: 8rem;
          }
          .error-title {
            font-size: 2rem;
          }
          .error-message {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .error-code {
            font-size: 6rem;
          }
        }
      `}</style>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800"></div>

      {/* Animated background particles */}
      <div 
        ref={particlesRef}
        className="absolute top-0 left-0 w-full h-full overflow-hidden z-10"
      ></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
        <div 
          ref={el => floatingElementsRef.current[0] = el}
          className="floating-element"
        ></div>
        <div 
          ref={el => floatingElementsRef.current[1] = el}
          className="floating-element"
        ></div>
        <div 
          ref={el => floatingElementsRef.current[2] = el}
          className="floating-element"
        ></div>
      </div>

      {/* Main Content */}
      <div className="text-center text-white z-30 relative max-w-2xl px-8">
        <div className="error-code">404</div>
        <h1 className="error-title">Oops! Page Not Found</h1>
        <p className="error-message text-white/90">
          The page you're looking for seems to have vanished into the digital void. 
          Don't worry though, even the best explorers sometimes take a wrong turn!
        </p>
        
        <div className="search-container">
          <div className="flex max-w-md mx-auto bg-white/20 rounded-full p-1 backdrop-blur-lg border border-white/30">
            <input
              type="text"
              className="flex-1 border-none bg-transparent px-5 py-3 text-white placeholder-white/70 outline-none"
              placeholder="Search for something else..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-red-400 to-yellow-400 border-none rounded-full px-6 py-3 text-white font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="buttons flex gap-4 justify-center flex-wrap">
          <button
            onClick={(e) => handleButtonClick(e, 'home')}
            className="relative overflow-hidden px-8 py-3 border-none rounded-full text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-white/30 hover:-translate-y-1 hover:shadow-xl"
          >
            Take Me Home
          </button>
          <button
            onClick={(e) => handleButtonClick(e, 'back')}
            className="relative overflow-hidden px-8 py-3 border-none rounded-full text-base font-semibold cursor-pointer transition-all duration-300 bg-white/20 text-white border-2 border-white/30 backdrop-blur-lg hover:-translate-y-1 hover:shadow-xl hover:bg-white/30"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}