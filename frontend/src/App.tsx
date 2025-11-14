import React from 'react';
import CodeGenerator from './components/CodeGenerator';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Full Stack Code Generator</h1>
        <p>Generate boilerplate code for your full stack applications</p>
      </header>
      <main className="app-main">
        <CodeGenerator />
      </main>
    </div>
  );
};

export default App;
