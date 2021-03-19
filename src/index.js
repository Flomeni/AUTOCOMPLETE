import './index.css';
import initSearchCars from './components/search-cars.component.js';

const startApp = () => {
    initSearchCars();
};

document.addEventListener('DOMContentLoaded', startApp);
