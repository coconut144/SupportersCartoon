
import './App.css';
import Artist from './Artist';
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
        <Event />
        <Work />
      </main>
    </div>
  );
}

export default App;
