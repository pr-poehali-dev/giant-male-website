import { useState, useEffect, useRef } from 'react';

type CubePosition = {
  x: number;
  y: number;
  direction: { x: number; y: number };
  speed: number;
};

const ShootingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [failScreen, setFailScreen] = useState(false);
  const [cubePosition, setCubePosition] = useState<CubePosition>({
    x: Math.random() * 80 + 10, // 10-90% of screen width
    y: Math.random() * 80 + 10, // 10-90% of screen height
    direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
    speed: 3,
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  // Начало игры
  const startGame = () => {
    setFailScreen(false);
    setScore(0);
    setIsPlaying(true);
    
    setCubePosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
      speed: 3,
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
        if (newX <= 0 || newX >= 100) newDirectionX *= -1;
        if (newY <= 0 || newY >= 100) newDirectionY *= -1;
        
        return {
          x: newX <= 0 ? 0 : newX >= 100 ? 100 : newX,
          y: newY <= 0 ? 0 : newY >= 100 ? 100 : newY,
          direction: { x: newDirectionX, y: newDirectionY },
          speed: prev.speed + 0.001, // Постепенное ускорение
        };
      });
      
      frameRef.current = requestAnimationFrame(updateCubePosition);
    };
    
    frameRef.current = requestAnimationFrame(updateCubePosition);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying]);

  // Проверка попадания
  const handleShoot = () => {
    if (!isPlaying || failScreen) return;
    
    const crosshairRect = crosshairRef.current?.getBoundingClientRect();
    const cubeRect = cubeRef.current?.getBoundingClientRect();
    
    if (!crosshairRect || !cubeRect) return;
    
    // Проверка пересечения прицела и куба
    const isOverlapping = !(
      crosshairRect.right < cubeRect.left ||
      crosshairRect.left > cubeRect.right ||
      crosshairRect.bottom < cubeRect.top ||
      crosshairRect.top > cubeRect.bottom
    );
    
    if (isOverlapping) {
      // Попадание
      setScore(prev => prev + 1);
      
      // Перемещаем куб
      setCubePosition(prev => ({
        ...prev,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        speed: prev.speed + 0.2, // Увеличиваем скорость при попадании
      }));
    } else {
      // Промах
      setIsPlaying(false);
      setFailScreen(true);
    }
  };

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center"
      onClick={handleShoot}
    >
      {!isPlaying && !failScreen && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); startGame(); }}
            className="bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg text-xl hover:bg-yellow-400 transition-colors"
          >
            Начать игру
          </button>
        </div>
      )}
      
      {failScreen && (
        <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center z-30">
          <div className="text-white text-4xl font-bold mb-8">Провал!</div>
          <div className="text-white text-2xl mb-8">Ваш счёт: {score}</div>
          <button 
            onClick={(e) => { e.stopPropagation(); startGame(); }}
            className="bg-white text-red-600 font-bold py-4 px-8 rounded-lg text-xl hover:bg-gray-100 transition-colors"
          >
            Начать заново
          </button>
        </div>
      )}
      
      <div ref={gameAreaRef} className="relative w-full h-full">
        {/* Прицел в центре */}
        <div 
          ref={crosshairRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative">
            <div className="w-24 h-24 border-4 rounded-full border-yellow-400"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-1 h-full bg-yellow-400 transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* Движущийся куб */}
        {isPlaying && (
          <div 
            ref={cubeRef}
            className="absolute w-12 h-12 bg-white z-10"
            style={{ 
              left: `${cubePosition.x}%`, 
              top: `${cubePosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          ></div>
        )}
      </div>
      
      {isPlaying && (
        <div className="absolute top-4 left-4 text-yellow-400 text-2xl font-bold z-30">
          Счёт: {score}
        </div>
      )}
    </div>
  );
};

export default ShootingGame;
