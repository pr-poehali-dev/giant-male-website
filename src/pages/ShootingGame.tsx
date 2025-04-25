import { useState, useEffect, useRef } from 'react';

type CubePosition = {
  x: number;
  y: number;
  direction: { x: number; y: number };
  speed: number;
  rotation: number;
};

const ShootingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [failScreen, setFailScreen] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('shootingGameHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [cubePosition, setCubePosition] = useState<CubePosition>({
    x: Math.random() * 80 + 10, // 10-90% of screen width
    y: Math.random() * 80 + 10, // 10-90% of screen height
    direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
    speed: 2,
    rotation: 0,
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const [crosshairSize, setCrosshairSize] = useState(100);

  // Начало игры
  const startGame = () => {
    setFailScreen(false);
    setScore(0);
    setIsPlaying(true);
    
    setCubePosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
      speed: 2,
      rotation: 0,
    });
  };

  // Обработка движения куба
  useEffect(() => {
    if (!isPlaying) return;

    const updateCubePosition = () => {
      setCubePosition(prev => {
        const newX = prev.x + prev.direction.x * prev.speed;
        const newY = prev.y + prev.direction.y * prev.speed;
        
        let newDirectionX = prev.direction.x;
        let newDirectionY = prev.direction.y;
        
        // Проверка отражения от границ
        if (newX <= 5 || newX >= 95) newDirectionX *= -1;
        if (newY <= 5 || newY >= 95) newDirectionY *= -1;
        
        // Обновление поворота для эффекта вращения
        const newRotation = (prev.rotation + 2) % 360;
        
        return {
          x: newX <= 5 ? 5 : newX >= 95 ? 95 : newX,
          y: newY <= 5 ? 5 : newY >= 95 ? 95 : newY,
          direction: { x: newDirectionX, y: newDirectionY },
          speed: Math.min(prev.speed + 0.002, 8), // Постепенное ускорение с ограничением
          rotation: newRotation,
        };
      });
      
      frameRef.current = requestAnimationFrame(updateCubePosition);
    };
    
    frameRef.current = requestAnimationFrame(updateCubePosition);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying]);

  // Обновление high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('shootingGameHighScore', String(score));
    }
  }, [score, highScore]);

  // Пульсация прицела
  useEffect(() => {
    if (!isPlaying) return;
    
    const pulseCrosshair = () => {
      setCrosshairSize(prev => {
        const newSize = prev + Math.sin(Date.now() / 300) * 5;
        return newSize;
      });
      
      requestAnimationFrame(pulseCrosshair);
    };
    
    const animId = requestAnimationFrame(pulseCrosshair);
    
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Проверка попадания с более справедливой системой пересечения
  const handleShoot = () => {
    if (!isPlaying || failScreen) return;
    
    const crosshairRect = crosshairRef.current?.getBoundingClientRect();
    const cubeRect = cubeRef.current?.getBoundingClientRect();
    
    if (!crosshairRect || !cubeRect) return;
    
    // Расчет центров
    const crosshairCenterX = crosshairRect.left + crosshairRect.width / 2;
    const crosshairCenterY = crosshairRect.top + crosshairRect.height / 2;
    const cubeCenterX = cubeRect.left + cubeRect.width / 2;
    const cubeCenterY = cubeRect.top + cubeRect.height / 2;
    
    // Расчет расстояния между центрами
    const distance = Math.sqrt(
      Math.pow(crosshairCenterX - cubeCenterX, 2) + 
      Math.pow(crosshairCenterY - cubeCenterY, 2)
    );
    
    // Проверка перекрытия с более мягкими условиями
    const hitRadius = (crosshairRect.width / 2) + (cubeRect.width / 2) * 0.8;
    const isOverlapping = distance < hitRadius;
    
    if (isOverlapping) {
      // Звуковой эффект попадания (опционально)
      try {
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaGR0aC1wYWl0IFNvdW5kIEVmZmVjdAAARXhUWFhYAAAAEwAAU29mdHdhcmUATGF2ZjU4LjI5LjEwMABUQUxCAAAAGQAAAFRpbWUsIHRoZSBCZWF0IC0gU291bmQgRWZmZWN0AFRTT0UAAAASAAAAT2N0LCAyMDIyIDAzOjQyOjUxAP/7kAAQAAR0cmFrAAAADv/jaIAMSXRlbUluZm8AAAAMYXJ0aXN0AAAAAP/jWxADTWF1ZGlvYm9va19tZXRhZGF0YV9hdWRpb2Jvb2tfbWV0YWRhdGEAABBkYXRhAAAAAE1BVURCWW9yIE1hcmtlcnMAP/uUYAAAAwFXwEBIAD1CujoU1IDuIFdtSkdAPUXEO9Tg');
        audio.volume = 0.2;
        audio.play();
      } catch (e) {
        console.log('Sound effect not supported');
      }
      
      // Попадание
      setScore(prev => prev + 1);
      
      // Перемещаем куб
      setCubePosition(prev => ({
        ...prev,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        speed: Math.min(prev.speed + 0.2, 8), // Увеличиваем скорость при попадании с ограничением
      }));
    } else {
      // Промах - звуковой эффект (опционально)
      try {
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaGR0aC1wYWl0IFNvdW5kIEVmZmVjdAAARXhUWFhYAAAAEwAAU29mdHdhcmUATGF2ZjU4LjI5LjEwMABUQUxCAAAAGQAAAFRpbWUsIHRoZSBCZWF0IC0gU291bmQgRWZmZWN0AFRTT0UAAAASAAAAT2N0LCAyMDIyIDAzOjQyOjUxAP/7kAAQAAR0cmFrAAAADv/jaIAMSXRlbUluZm8AAAAMYXJ0aXN0AAAAAP/jWxADTWF1ZGlvYm9va19tZXRhZGF0YV9hdWRpb2Jvb2tfbWV0YWRhdGEAABBkYXRhAAAAAE1BVURCWW9yIE1hcmtlcnMAP/uUYAAAAvpdUzxoAD1HdDXpiAHqKF1TfMcA9SSQ61MQA9oo');
        audio.volume = 0.2;
        audio.play();
      } catch (e) {
        console.log('Sound effect not supported');
      }
      
      // Промах
      setIsPlaying(false);
      setFailScreen(true);
    }
  };

  return (
    <div 
      className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden flex flex-col items-center justify-center"
      onClick={handleShoot}
    >
      {/* Анимированный фон с частицами */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-yellow-500 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 7}s`
            }}
          />
        ))}
      </div>
      
      {/* Сетка координат */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="grid grid-cols-12 h-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-yellow-800"></div>
          ))}
        </div>
        <div className="grid grid-rows-12 h-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-b border-yellow-800"></div>
          ))}
        </div>
      </div>

      {!isPlaying && !failScreen && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-70">
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-10 max-w-md text-center shadow-lg shadow-yellow-600/20">
            <h2 className="text-yellow-500 text-3xl font-bold mb-6 tracking-wider">TACTICAL TARGETING</h2>
            <p className="text-yellow-200 mb-8 opacity-80">Поразите движущуюся цель когда она пересекается с прицелом</p>
            <div className="text-yellow-300 mb-4 text-sm">Рекорд: {highScore}</div>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="relative overflow-hidden bg-yellow-600 text-black font-bold py-4 px-12 rounded-lg text-xl transition-all hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-600/30 group"
            >
              <span className="relative z-10">НАЧАТЬ МИССИЮ</span>
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </button>
            <div className="mt-6 text-gray-400 text-sm">Нажмите когда цель в прицеле</div>
          </div>
        </div>
      )}
      
      {failScreen && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center z-30">
          <div className="relative max-w-md text-center">
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
              <div className="w-40 h-40 border-8 border-red-500 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-0 w-full h-2 bg-red-500 transform -translate-y-1/2"></div>
              <div className="absolute top-0 left-1/2 w-2 h-full bg-red-500 transform -translate-x-1/2"></div>
            </div>
            
            <h2 className="text-red-300 text-5xl font-bold mb-2 tracking-widest">ПРОМАХ!</h2>
            <div className="text-yellow-200 text-xl mb-8">
              <span className="font-mono">SCORE:</span> <span className="text-2xl font-bold">{score}</span>
            </div>
            <div className="text-gray-300 mb-2 text-sm">Личный рекорд: {highScore}</div>
            <div className="flex flex-col items-center mt-10">
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="relative overflow-hidden bg-red-600 text-white font-bold py-4 px-12 rounded-lg text-xl border-2 border-red-500 transition-all hover:bg-red-500 hover:text-white group"
              >
                <span className="relative z-10 group-hover:tracking-wider transition-all">ПОВТОРИТЬ</span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div ref={gameAreaRef} className="relative w-full h-full">
        {/* Прицел в центре */}
        <div 
          ref={crosshairRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ 
            width: `${crosshairSize}px`, 
            height: `${crosshairSize}px` 
          }}
        >
          <div className="relative h-full w-full">
            {/* Внешняя окружность */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500 opacity-30"></div>
            
            {/* Основная окружность */}
            <div className="absolute inset-2 rounded-full border-2 border-yellow-400">
              <div className="absolute top-0 left-1/2 w-1 h-3 bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-yellow-400 transform -translate-x-1/2 translate-y-1/2"></div>
              <div className="absolute top-1/2 left-0 h-1 w-3 bg-yellow-400 transform -translate-y-1/2 -translate-x-1/2"></div>
              <div className="absolute top-1/2 right-0 h-1 w-3 bg-yellow-400 transform -translate-y-1/2 translate-x-1/2"></div>
            </div>
            
            {/* Внутренняя окружность с градиентом */}
            <div className="absolute inset-4 rounded-full border border-yellow-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-yellow-300/20"></div>
            </div>
            
            {/* Перекрестие */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent transform -translate-x-1/2"></div>
            
            {/* Центральная точка */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full bg-yellow-300 shadow-lg shadow-yellow-500/50"></div>
              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-yellow-100 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            {/* Дополнительные маркеры расстояния */}
            <div className="absolute inset-8 rounded-full border border-yellow-500/30 animate-pulse" 
              style={{ animationDuration: '3s' }}></div>
            
            {/* Данные прицела */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-500/80 font-mono bg-black/30 px-2 rounded">
              R-{score.toString().padStart(3, '0')}
            </div>
          </div>
        </div>
        
        {/* Движущийся куб с текстурой */}
        {isPlaying && (
          <div 
            ref={cubeRef}
            className="absolute z-10 shadow-lg shadow-yellow-600/30"
            style={{ 
              left: `${cubePosition.x}%`, 
              top: `${cubePosition.y}%`,
              transform: `translate(-50%, -50%) rotate(${cubePosition.rotation}deg)`,
              width: '40px',
              height: '40px',
              transition: 'box-shadow 0.2s',
            }}
          >
            {/* 3D эффект куба */}
            <div className="relative w-full h-full transform">
              {/* Основная грань */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm border border-yellow-300">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-1 opacity-70">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-yellow-200/10 rounded-sm"></div>
                  ))}
                </div>
              </div>
              
              {/* Левая грань для 3D эффекта */}
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-800 transform origin-left skew-y-45 -translate-x-2"></div>
              
              {/* Верхняя грань для 3D эффекта */}
              <div className="absolute top-0 left-0 w-full h-2 bg-yellow-700 transform origin-top skew-x-45 -translate-y-2"></div>
              
              {/* Блики */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-100 rounded-full opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-yellow-100 rounded-full opacity-40"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Счетчик очков */}
      {isPlaying && (
        <div className="absolute top-4 left-4 z-30 flex items-center">
          <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
            <div className="text-yellow-400 font-mono font-bold">
              <span className="text-yellow-300/70 mr-2 text-sm tracking-wider">СЧЁТ:</span>
              <span className="text-2xl">{score}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Уровень скорости */}
      {isPlaying && (
        <div className="absolute top-4 right-4 z-30">
          <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
            <div className="text-yellow-400 font-mono text-sm">
              <span className="text-yellow-300/70 mr-2 tracking-wider">СКОРОСТЬ:</span>
              <span className="text-lg">{Math.floor(cubePosition.speed * 10)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Индикатор рекорда */}
      {isPlaying && score > 0 && (
        <div className="absolute bottom-4 left-4 z-30">
          <div className="text-gray-400 font-mono text-xs flex items-center">
            <span className="text-yellow-600 mr-2">РЕКОРД:</span>
            <span>{highScore}</span>
            {score >= highScore && (
              <span className="ml-2 text-yellow-500 animate-pulse">⭐ НОВЫЙ!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShootingGame;
