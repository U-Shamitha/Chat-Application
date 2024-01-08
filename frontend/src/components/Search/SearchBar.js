import React, { useState } from 'react';
import classes from './searchBar.module..css'; // Import the generated CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({setSearchOpponent}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search term change
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setSearchOpponent(e.target.value)
  };

  return (
    <div className="container p-4">
      <form className={classes.searchForm}>
        <div className="flex gap-5 flex-col sm:justify-evenly sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 min-w-[250px]">
          <div className='relative' style={{flexGrow:'1'}}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className="p-2 border border-gray-300 rounded pl-10 w-3/4 sm:w-full"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;