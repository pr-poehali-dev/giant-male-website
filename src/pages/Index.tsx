
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-black">Стрелковая игра</h1>
        <p className="text-xl text-gray-600 mb-6">
          Испытайте свою точность в игре с движущимся кубом и прицелом.
        </p>
        <Link 
          to="/game"
          className="block w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors text-lg"
        >
          Начать игру
        </Link>
      </div>
    </div>
  );
};

export default Index;
