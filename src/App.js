
import './App.css';
import Artist from './Artist';
import Contact from './contact';
import Event from './Event';
import Work from './Work';


function App() {
  return (
    <div className="App">
      <header className="main-header">
        <h1>Cartoon BNK48</h1>
      </header>
      <main>
        <Artist />
        <Contact />
        <Event />
        <Work />
        {/* <div className="event-work-row">
          <Event />
          <Work />
        </div> */}
      </main>
    </div>
  );
}

export default App;
