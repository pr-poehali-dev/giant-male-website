import { useState, useEffect, useRef } from 'react';

type CubePosition = {
  x: number;
  y: number;
  direction: { x: number; y: number };
  speed: number;
  rotation: number;
  scale: number;
};

const ShootingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [failScreen, setFailScreen] = useState(false);
  const [failMessage, setFailMessage] = useState('');
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
    scale: 1,
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const [crosshairSize, setCrosshairSize] = useState(100);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [autoPlayIntro, setAutoPlayIntro] = useState(true);

  // Автозапуск игры
  useEffect(() => {
    if (autoPlayIntro) {
      setAutoPlayIntro(false);
      startGame();
    }
  }, [autoPlayIntro]);

  // Начало игры
  const startGame = () => {
    setFailScreen(false);
    setScore(0);
    setIsPlaying(true);
    
    // Сбрасываем позицию куба и увеличиваем начальную скорость для более интенсивного геймплея
    setCubePosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
      speed: 2.5, // Слегка выше начальная скорость
      rotation: 0,
      scale: 1,
    });
  };

  // Обработка движения куба с более интересной траекторией
  useEffect(() => {
    if (!isPlaying) return;

    const updateCubePosition = () => {
      setCubePosition(prev => {
        // Базовое движение
        let newX = prev.x + prev.direction.x * prev.speed;
        let newY = prev.y + prev.direction.y * prev.speed;
        
        let newDirectionX = prev.direction.x;
        let newDirectionY = prev.direction.y;
        
        // Проверка отражения от границ
        if (newX <= 5 || newX >= 95) newDirectionX *= -1;
        if (newY <= 5 || newY >= 95) newDirectionY *= -1;
        
        // Небольшая случайная вариация направления для более натурального движения
        // с вероятностью 2%
        if (Math.random() < 0.02) {
          newDirectionX += (Math.random() - 0.5) * 0.3;
          newDirectionY += (Math.random() - 0.5) * 0.3;
          
          // Нормализация вектора направления
          const length = Math.sqrt(newDirectionX * newDirectionX + newDirectionY * newDirectionY);
          newDirectionX /= length;
          newDirectionY /= length;
        }
        
        // Обновление поворота для эффекта вращения
        const newRotation = (prev.rotation + 2) % 360;
        
        // Пульсация размера для визуального эффекта
        const newScale = 1 + Math.sin(Date.now() / 500) * 0.05;
        
        // Обеспечиваем, что куб будет пересекаться с прицелом
        // Если куб слишком далеко от центра, помогаем ему "найти" прицел
        const distFromCenter = Math.sqrt(
          Math.pow((newX - 50), 2) + 
          Math.pow((newY - 50), 2)
        );
        
        // Если куб слишком далеко от центра (прицела), слегка направляем его к центру
        if (distFromCenter > 60 && Math.random() < 0.1) {
          newDirectionX = newDirectionX * 0.8 + ((50 - newX) / 50) * 0.2;
          newDirectionY = newDirectionY * 0.8 + ((50 - newY) / 50) * 0.2;
          
          // Нормализация направления
          const length = Math.sqrt(newDirectionX * newDirectionX + newDirectionY * newDirectionY);
          newDirectionX /= length;
          newDirectionY /= length;
        }
        
        // Периодически направляем куб через прицел
        if (score > 5 && Math.random() < 0.03) {
          // Направление к центру экрана
          newDirectionX = ((50 - newX) / 50);
          newDirectionY = ((50 - newY) / 50);
          
          // Нормализация направления
          const length = Math.sqrt(newDirectionX * newDirectionX + newDirectionY * newDirectionY);
          newDirectionX /= length;
          newDirectionY /= length;
        }
        
        return {
          x: newX <= 5 ? 5 : newX >= 95 ? 95 : newX,
          y: newY <= 5 ? 5 : newY >= 95 ? 95 : newY,
          direction: { x: newDirectionX, y: newDirectionY },
          speed: Math.min(prev.speed + 0.002, 8), // Постепенное ускорение с ограничением
          rotation: newRotation,
          scale: newScale,
        };
      });
      
      frameRef.current = requestAnimationFrame(updateCubePosition);
    };
    
    frameRef.current = requestAnimationFrame(updateCubePosition);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, score]);

  // Обновление high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('shootingGameHighScore', String(score));
    }
  }, [score, highScore]);

  // Пульсация прицела и случайные визуальные глитчи
  useEffect(() => {
    if (!isPlaying) return;
    
    const pulseCrosshair = () => {
      setCrosshairSize(prev => {
        const newSize = prev + Math.sin(Date.now() / 300) * 5;
        return newSize;
      });
      
      // Случайный глитч-эффект
      if (Math.random() < 0.005) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 100 + Math.random() * 200);
      }
      
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
    
    // Более мягкие условия для попадания, учитывая видимый перехлест
    const hitRadius = (crosshairRect.width / 2) + (cubeRect.width / 2) * 0.9;
    const isOverlapping = distance < hitRadius;
    
    if (isOverlapping) {
      // Звуковой эффект попадания
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
      
      // Добавляем глитч-эффект при успешном попадании
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 150);
    } else {
      // Промах - звуковой эффект
      try {
        const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaGR0aC1wYWl0IFNvdW5kIEVmZmVjdAAARXhUWFhYAAAAEwAAU29mdHdhcmUATGF2ZjU4LjI5LjEwMABUQUxCAAAAGQAAAFRpbWUsIHRoZSBCZWF0IC0gU291bmQgRWZmZWN0AFRTT0UAAAASAAAAT2N0LCAyMDIyIDAzOjQyOjUxAP/7kAAQAAR0cmFrAAAADv/jaIAMSXRlbUluZm8AAAAMYXJ0aXN0AAAAAP/jWxADTWF1ZGlvYm9va19tZXRhZGF0YV9hdWRpb2Jvb2tfbWV0YWRhdGEAABBkYXRhAAAAAE1BVURCWW9yIE1hcmtlcnMAP/uUYAAAAvpdUzxoAD1HdDXpiAHqKF1TfMcA9SSQ61MQA9oo');
        audio.volume = 0.2;
        audio.play();
      } catch (e) {
        console.log('Sound effect not supported');
      }
      
      // Рассчитываем причину неудачи
      if (distance > hitRadius * 1.5) {
        setFailMessage('СЛИШКОМ ДАЛЕКО');
      } else {
        setFailMessage('НЕТОЧНОЕ ПОПАДАНИЕ');
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
        {[...Array(70)].map((_, i) => (
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

      {/* Лучи сканирования */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-[scanline_4s_linear_infinite]"
          style={{
            animation: 'scanline 4s linear infinite',
            '@keyframes scanline': {
              '0%': { top: '0%' },
              '100%': { top: '100%' }
            }
          }}
        ></div>
        <div 
          className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent animate-[scanline-h_5s_linear_infinite]"
          style={{
            animation: 'scanline-h 5s linear infinite',
            '@keyframes scanline-h': {
              '0%': { left: '0%' },
              '100%': { left: '100%' }
            }
          }}
        ></div>
      </div>
      
      {failScreen && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center z-30">
          <div className="relative max-w-md text-center">
            {/* Глитч-эффект */}
            <div className="absolute inset-0 animate-[glitch_0.3s_cubic-bezier(.25,.46,.45,.94)_both] opacity-70" 
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 25%, 0 25%, 0 30%, 100% 30%, 100% 50%, 0 50%, 0 60%, 100% 60%, 100% 75%, 0 75%, 0 80%, 100% 80%, 100% 100%, 0 100%)' }}>
            </div>
            
            {/* Фоновый узор */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20" 
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, #ff0000, #ff0000 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, #ff0000, #ff0000 1px, transparent 1px, transparent 10px)' }}>
            </div>
            
            {/* Мигающие точки */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-red-300 rounded-full animate-[blink_1s_ease-in-out_infinite]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`
                }}
              ></div>
            ))}
            
            {/* Символ ошибки */}
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
              <div className="w-40 h-40 border-8 border-red-500 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-0 w-full h-2 bg-red-500 transform -translate-y-1/2"></div>
              <div className="absolute top-0 left-1/2 w-2 h-full bg-red-500 transform -translate-x-1/2"></div>
              
              {/* Дополнительные декоративные элементы */}
              <div className="absolute inset-4 border-4 border-dashed border-red-400/50 rounded-full animate-spin" 
                  style={{ animationDuration: '10s' }}></div>
              <div className="absolute inset-8 border-2 border-red-300/30 rounded-full"></div>
            </div>
            
            <h2 className="text-red-300 text-5xl font-bold mb-2 tracking-widest animate-[pulse_2s_ease-in-out_infinite]">ПРОМАХ!</h2>
            <div className="text-red-100/80 text-xl mb-4">{failMessage}</div>
            
            <div className="text-yellow-200 text-xl mb-6 bg-red-950/50 rounded-lg py-2 px-4 border border-red-800/50">
              <span className="font-mono">СЧЁТ:</span> <span className="text-2xl font-bold ml-2">{score}</span>
            </div>
            
            <div className="text-gray-300 mb-6 text-sm flex justify-center items-center space-x-2">
              <span>Личный рекорд:</span> 
              <span className="text-lg font-bold">{highScore}</span>
              {score >= highScore && score > 0 && <span className="text-yellow-300 animate-pulse">⭐</span>}
            </div>
            
            {/* Диагностическая информация */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-6 font-mono bg-red-950/30 p-2 rounded border border-red-800/30">
              <div>ТОЧНОСТЬ: {Math.round(score ? (score / (score + 1)) * 100 : 0)}%</div>
              <div>ВРЕМЯ: {Math.round(score * 0.8)}с</div>
              <div>ЦЕЛИ: {score}</div>
              <div>СТАТУС: ЗАВЕРШЕНО</div>
            </div>
            
            <div className="flex flex-col items-center mt-6">
              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="relative overflow-hidden bg-red-600 text-white font-bold py-4 px-12 rounded-lg text-xl border-2 border-red-500 transition-all hover:bg-red-500 hover:text-white group"
              >
                <span className="relative z-10 group-hover:tracking-wider transition-all">ВОЗОБНОВИТЬ</span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
              
              {/* Декоративная анимация вокруг кнопки */}
              <div className="absolute -inset-4 border border-red-500/30 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={gameAreaRef} className="relative w-full h-full">
        {/* Прицел в центре */}
        <div 
          ref={crosshairRef}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 ${glitchEffect ? 'translate-x-[2px] -translate-y-[3px]' : ''}`}
          style={{ 
            width: `${crosshairSize}px`, 
            height: `${crosshairSize}px`,
            transition: glitchEffect ? 'none' : 'transform 0.1s ease-out' 
          }}
        >
          <div className="relative h-full w-full">
            {/* Внешняя окружность с пульсацией */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/40 animate-[pulse_4s_ease-in-out_infinite]"></div>
            
            {/* Светящийся внешний ореол */}
            <div className="absolute -inset-4 rounded-full bg-yellow-500/5 blur-sm"></div>
            
            {/* Основная окружность */}
            <div className="absolute inset-2 rounded-full border-2 border-yellow-400">
              {/* Контрольные метки по окружности */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * (Math.PI / 180);
                const size = i % 2 === 0 ? 3 : 2;
                return (
                  <div 
                    key={i}
                    className="absolute w-1 bg-yellow-400"
                    style={{
                      height: `${size}px`,
                      transform: `rotate(${i * 45}deg) translateY(${-crosshairSize / 2}px)`,
                      left: '50%',
                      top: '50%',
                    }}
                  ></div>
                );
              })}
            </div>
            
            {/* Внутренняя окружность с градиентом */}
            <div className="absolute inset-4 rounded-full border border-yellow-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-yellow-300/20"></div>
              
              {/* Дополнительные детали внутри окружности */}
              <div className="absolute inset-3 rounded-full border border-dashed border-yellow-400/30"></div>
              
              {/* Технические маркеры */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[6px] text-yellow-400/60 font-mono">+</div>
              {['N','E','S','W'].map((dir, i) => (
                <div 
                  key={dir}
                  className="absolute text-[6px] text-yellow-400/40 font-mono"
                  style={{
                    transform: i % 2 === 0 
                      ? `translate(-50%, ${i === 0 ? '-100%' : '0'}) ${i === 2 ? 'translateY(6px)' : ''}`
                      : `translate(${i === 1 ? '0' : '-100%'}, -50%) ${i === 1 ? 'translateX(6px)' : 'translateX(-6px)'}`,
                    top: i % 2 === 0 ? (i === 0 ? '0' : '100%') : '50%',
                    left: i % 2 === 0 ? '50%' : (i === 1 ? '100%' : '0')
                  }}
                >
                  {dir}
                </div>
              ))}
            </div>
            
            {/* Перекрестие с градиентом */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent transform -translate-x-1/2"></div>
            
            {/* Центральная точка с внутренним блеском */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-300 shadow-lg shadow-yellow-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300 to-yellow-100"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-yellow-100 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            {/* Дополнительные маркеры расстояния с анимацией */}
            <div className="absolute inset-8 rounded-full border border-yellow-500/30 animate-pulse" 
              style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-16 rounded-full border border-yellow-500/20 animate-pulse" 
              style={{ animationDuration: '5s' }}></div>
            
            {/* Тонкие детали вокруг прицела */}
            <div className="absolute inset-0 rounded-full">
              {[...Array(12)].map((_, i) => {
                const angle = i * 30;
                const isMainDirection = i % 3 === 0;
                return (
                  <div 
                    key={i}
                    className={`absolute top-1/2 left-1/2 w-0.5 ${isMainDirection ? 'h-2 bg-yellow-400' : 'h-1 bg-yellow-500/40'}`}
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${-crosshairSize / 2 - 4}px)`,
                    }}
                  ></div>
                )
              })}
            </div>
            
            {/* Технические данные прицела */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-500/80 font-mono bg-black/50 px-3 py-0.5 rounded-full border border-yellow-500/20">
              <div className="flex items-center space-x-2">
                <span className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
                <span>TGT-{score.toString().padStart(3, '0')}</span>
                <span className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
              </div>
            </div>
            
            {/* Дополнительная техническая информация */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[8px] text-yellow-500/60 font-mono">
              <div className="flex flex-col items-center">
                <div className="flex space-x-1">
                  <span>{Math.round(cubePosition.speed * 10)}</span>
                  <span>|</span>
                  <span>{Math.round(crosshairSize)}</span>
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Движущийся куб с 3D-эффектом и текстурой */}
        {isPlaying && (
          <div 
            ref={cubeRef}
            className="absolute z-10 shadow-lg shadow-yellow-600/30"
            style={{ 
              left: `${cubePosition.x}%`, 
              top: `${cubePosition.y}%`,
              transform: `translate(-50%, -50%) rotate(${cubePosition.rotation}deg) scale(${cubePosition.scale})`,
              width: '44px',
              height: '44px',
              transition: 'box-shadow 0.2s',
            }}
          >
            {/* 3D эффект куба */}
            <div className="relative w-full h-full transform">
              {/* Основная грань */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm border border-yellow-300">
                {/* Сложная внутренняя текстура */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-1 opacity-80">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-yellow-200/10 rounded-sm relative overflow-hidden">
                      {/* Технологические линии внутри каждой ячейки */}
                      <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-300/20 transform -translate-y-1/2"></div>
                        <div className="absolute top-0 left-1/2 h-full w-[1px] bg-yellow-300/20 transform -translate-x-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Мигающие индикаторы */}
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-200 animate-pulse"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" 
                  style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Левая грань для 3D эффекта */}
              <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-yellow-800 to-yellow-900 transform origin-left skew-y-45 -translate-x-3">
                {/* Технологические детали на боковой грани */}
                <div className="absolute inset-0 grid grid-rows-4 gap-0.5 p-0.5 opacity-50">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-yellow-500/10 rounded-sm"></div>
                  ))}
                </div>
              </div>
              
              {/* Верхняя грань для 3D эффекта */}
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-700 to-yellow-800 transform origin-top skew-x-45 -translate-y-3">
                {/* Узор на верхней грани */}
                <div className="absolute inset-0 grid grid-cols-4 gap-0.5 p-0.5 opacity-50">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-yellow-500/10 rounded-sm"></div>
                  ))}
                </div>
              </div>
              
              {/* Детализированные блики */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-yellow-100 to-transparent rounded-full opacity-70"></div>
              <div className="absolute bottom-1 left-1 w-2 h-2 bg-gradient-to-tl from-yellow-100 to-transparent rounded-full opacity-40"></div>
              
              {/* Технологические маркеры на кубе */}
              <div className="absolute inset-1 text-[6px] text-yellow-900/70 font-mono">
                <div className="absolute top-0 left-0">01</div>
                <div className="absolute bottom-0 right-0">TX</div>
              </div>
            </div>
            
            {/* Аура энергии вокруг куба */}
            <div className="absolute -inset-2 rounded-full bg-yellow-500/10 blur-sm animate-pulse"></div>
            
            {/* Трейл за кубом при движении */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-40">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-full h-full bg-yellow-500/20 rounded-sm"
                  style={{
                    transform: `translate(${Math.sin(cubePosition.rotation * (Math.PI / 180)) * (i+1) * 2}px, ${Math.cos(cubePosition.rotation * (Math.PI / 180)) * (i+1) * 2}px) scale(${1 - i * 0.2})`,
                    opacity: 0.5 - i * 0.1
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Счетчик очков */}
      {isPlaying && (
        <div className="absolute top-4 left-4 z-30 flex items-center">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
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
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
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
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/20 flex items-center space-x-2">
            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="text-yellow-400 font-mono text-xs flex items-center">
              <span className="text-yellow-600 mr-2">РЕКОРД:</span>
              <span>{highScore}</span>
              {score >= highScore && (
                <span className="ml-2 text-yellow-500 animate-pulse">⭐ НОВЫЙ!</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Технические данные */}
      {isPlaying && (
        <div className="absolute bottom-4 right-4 z-30">
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/20">
            <div className="text-yellow-600/80 font-mono text-xs">
              <span className="mr-1">СТАТУС:</span>
              <span className="text-yellow-400">АКТИВЕН</span>
              <span className="ml-1 inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShootingGame;
