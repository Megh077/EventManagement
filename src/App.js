import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Importation from './screens/Importation';
import Display from './screens/Display';
import EventTasks from './screens/EventTasks';
function App() {
  return(
  <Router>
    <Routes>
      <Route path="/" element={<Importation/>}/>
      <Route path="/display" element={<Display/>}/>
      {/* <Route path="/eventTasks" element={<EventTasks/>}/> */}
      <Route  path="/eventTasks/:eventId" element={<EventTasks />}/>
    </Routes>
  </Router>
  );
  }
export default App;


        
