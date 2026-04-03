import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Treatments from './Treatments';
import Promotions from './Promotions';
import Reserva from './Reserva';


const Main = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tratamientos" element={<Treatments />} />
        <Route path="/promociones" element={<Promotions />} />
        <Route path="/reserva" element={<Reserva />} />

      </Routes>
    </main>
  );
};

export default Main;
