'use strict';

import React from 'react';

class Home extends React.Component {

  handleChange(event) {
    alert("ssss");
  }

  render() {
    return (
      <div className='alert alert-info'>
        Hello from Home Component
        <input
          type="text"
          value="hello"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default Home;
