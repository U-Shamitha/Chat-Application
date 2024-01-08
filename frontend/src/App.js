import { useDispatch } from 'react-redux';
import AllRoutes from './AllRoutes';
import './App.css';
import { fetchUser } from './redux/userSlice';

function App() {

  const dispatch = useDispatch();
  dispatch(fetchUser());

  return (
    <div className="bg-gray-100 flex justify-center items-center">
      <div className="">
        <AllRoutes/>
      </div>
    </div>
  );
}

export default App;
