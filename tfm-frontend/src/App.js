import HomePage from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;
