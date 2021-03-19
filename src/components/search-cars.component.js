import {Autocomplete} from '../classes/autocomplete.js';
import './search-cars.component.css';

const initSearchCars = () => {
    const elementToken = 'max-bangson-autocomplete';
    const selector = document.getElementById(elementToken);
    const autocomplete = new Autocomplete({searchFn: suggestionsSearch, selector});

    const cb = ({value}) => {
         console.log(value);
    };

    autocomplete.onClick(cb);
};

function suggestionsSearch(query) {
    const cars = ['Audi A4', 'Audi A6', 'Audi A8', 'Audi RS4', 'Audi RS6', 'BMW Series 3', 'BMW Series 5', 'BMW Series 7', 'BMW X3', 'BMW X5', 'BMW X6', 'MB C-Class', 'MB E-Class', 'MB S-Class'];
    const filteredCars = cars.filter(car => car.toLowerCase().includes(query.toLowerCase()));

    return new Promise((resolve) => {
        resolve(filteredCars); 
    });
}

export default initSearchCars;
