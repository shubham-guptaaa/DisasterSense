import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-lg shadow-xl p-6 sm:p-10 text-center">
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-white">🌐</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">DisasterSense</h1>
          <p className="text-sm sm:text-base text-gray-600">Your platform for disaster management and response</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/login" 
            className="block w-full py-2.5 sm:py-3 px-4 font-semibold text-white bg-indigo-600 rounded-md transition duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </Link>
          
          <Link 
            to="/signup" 
            className="block w-full py-2.5 sm:py-3 px-4 font-semibold text-indigo-600 bg-white rounded-md border border-indigo-600 transition duration-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="mt-8 text-xs sm:text-sm text-gray-500">
          <p>Access the platform to monitor and respond to disasters in real-time</p>
          <p className="mt-2">Stay informed and help your community stay safe</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
