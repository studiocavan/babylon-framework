import React from 'react';
import './App.css';
import K8sFrameworkPOC from './K8sFrameworkPOC';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Babylon Framework - Full Stack Code Generator</h1>
        <p>Generate boilerplate code for your full stack applications</p>
      </header>
      <main className="app-main">
        <div className="max-w-7xl mx-auto">
          <K8sFrameworkPOC />
        </div>
      </main>
    </div>
  );
};

export default App;
