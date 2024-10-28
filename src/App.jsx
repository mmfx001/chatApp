import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Messenger from './Massage';
import Login from './Login';
import Navbar from './Navbar';
// Some Home component

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/*" element={<Login />} />
        <Route path="/messenger" element={<Messenger />} />
      </Routes>
    </div>

  );
};

export default App;
