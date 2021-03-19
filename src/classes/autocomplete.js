import './autocomplete.css';

const AUTOCOMPLETE_CONTAINER = 'autocomplete-container';
const AUTOCOMPLETE_ITEM = 'autocomplete-container__item';

export class Autocomplete {

    static DEFAULT_MIN_LENGTH = 3;

    static DATASET_AUTOCOMPLETE_ITEM = 'autocompleteItem';

    static DATASET_AUTOCOMPLETE_value = 'value';

    static EVENT_ON_AUTOCOMPLETE_CLICK = 'onautocompleteclick';

    /**
     * { Element } - Container for suggestions.
     */
    _container;

    /**
     * { Element } - Input element.
     */
    _selector;

    /**
     * {number} - minimum input length to start suggestions search.
     */
    _minLength;

    _searchFn;

    /**
     * 
     * @param {Function} - suggestionsSearchFn. Callback that fires on each input stroke with length >= MIN_LENGTH.
     * @param {Element} - selector 
     * @param {number} - min length of query
     */
    constructor({searchFn, selector, minLength}) {
        this._searchFn = searchFn;
        this._selector = selector;
        this._minLength = minLength || Autocomplete.DEFAULT_MIN_LENGTH;

        this._init(selector);
    }

    /**
     * Emitter that is called when autocomplete item has been selected.
     * @publicapi
     * 
     * @emits Interface {
     *     selectedItem: Element;
     *     value: any;
     * }
     * @param {Function} - Callback function
     * @returns {void} 
     */
    onClick(cb) {
        document.addEventListener(Autocomplete.EVENT_ON_AUTOCOMPLETE_CLICK, (e) => cb({
            selectedItem: e.detail.target,
            value: e.detail.value
        }));
    }

    _init(selector) {
        this._subscribeToInputChanges(selector);
        this._handleOutsideClicks();
    }

    _handleOutsideClicks() {
        document.addEventListener('click', (e) => {    
            if (this._container && !this._container.contains(e.target)) {
                this._clearContainer();
            }
        });
    }

    /**
     * 
     * @param {Element} selector - autocomplete input element. 
     */
    _subscribeToInputChanges(selector) {
        const cb = async (e) => {
            const query = e.target.value;
            // skip empty or short queries
            if (!query || query.length < this._minLength) {
                this._clearContainer();
                return;
            }

            try {
                const data = await this._search(query);

                this._renderSuggestions(data, selector);
            } catch (e) {
                console.error(e);
            }
        };

        selector.addEventListener('input', cb);
    }

    /**
     * 
     * @param {Array} data - array of values to be rendered.
     * 
     */
    _renderSuggestions(data, selector) {
        this._clearContainer();

        if (!this._container) {
            this._container = document.createElement('ul');
            this._container.classList.add(AUTOCOMPLETE_CONTAINER);
        }

        
        this._container.addEventListener('click', (e) => this._onClickHandler(e));

        const renderItem = item => {
            const li = document.createElement('li');
            li.classList.add(AUTOCOMPLETE_ITEM);
            li.innerHTML = item;
            li.dataset['autocompleteItem'] = true;
            li.dataset['value'] = item;

            this._container.append(li);
        };

        data.forEach(renderItem);

        selector.insertAdjacentElement('afterend', this._container);
    }

    /**
     * Callback that uses 'behavior' pattern of event delegation for autocomplete items.
     * @param {*} event 
     */
    _onClickHandler(event) {
        const dataset = event.target.dataset;

        if (dataset[Autocomplete.DATASET_AUTOCOMPLETE_ITEM]) {
            const value = dataset[Autocomplete.DATASET_AUTOCOMPLETE_value];
            this._selector.value = value;

            this._clearContainer();
            this._dispatchOnClick(event.target, value);
        }
    }

    _dispatchOnClick(target, value) {
        const detail = {
            target,
            value
        };
        const customEvent = new CustomEvent(Autocomplete.EVENT_ON_AUTOCOMPLETE_CLICK, {bubbles: false, detail});

        document.dispatchEvent(customEvent);
    }

    _clearContainer() {
        if (this._container) {
            this._container.innerHTML = '';
            this._container.remove();
        }
    }

    /**
     * Primarily designed to work with outer callback, passed by the end user, but also can work with plain arrays or unresolved
     *  Promises if user doesnt wanna run http query to the server and just passes array of some data.
     * @param {string} query 
     * @returns {void | never}
     */
    async _search(query) {
        const {_searchFn: fn} = this;
 
        // callback with request to the server
        if (typeof fn === 'function') {
            return await fn(query);
        // plain array of values
        } else if (Array.isArray(fn)) {
            return fn;
        // unresolved promise
        } else if (fn instanceof Promise) {
            return await fn;
        } else {
            throw new Error(`Provided data has unsupported type: ${typeof fn}.
            Please provide Array or callback to fetch data.`);
        }
    }
}
