
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <div className="relative z-10 text-center max-w-md p-8 bg-gray-900/80 rounded-xl border border-yellow-500/30 shadow-xl backdrop-blur-sm">
        <h1 className="text-4xl font-bold mb-4 text-yellow-400 tracking-wider">TACTICAL TARGETING</h1>
        <p className="text-lg text-yellow-100/80 mb-6">
          Испытайте свою точность в тактической игре с высокотехнологичным прицелом.
        </p>
        <Link 
          to="/game"
          className="block w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-all text-lg hover:tracking-wider relative overflow-hidden group"
        >
          <span className="relative z-10">НАЧАТЬ МИССИЮ</span>
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        </Link>
        
        {/* Фоновые частицы */}
        <div className="absolute inset-0 -z-10">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-yellow-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Фоновые элементы */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-yellow-900/10 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-yellow-700/20"></div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full grid grid-rows-12 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-b border-yellow-700/20"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
