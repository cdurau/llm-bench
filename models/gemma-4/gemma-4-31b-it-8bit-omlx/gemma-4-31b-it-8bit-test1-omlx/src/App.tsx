import { PulseProvider } from './context/PulseContext';
import { PulseBoard } from './components/PulseBoard';

function App() {
  return (
    <PulseProvider>
      <PulseBoard />
    </PulseProvider>
  );
}

export default App;
