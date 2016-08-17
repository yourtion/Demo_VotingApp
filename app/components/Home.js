'use strict';

import React from 'react';

class Home extends React.Component {
  handleChange(event) {
    alert("ssss");
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <div className='alert alert-info'>
        Hello from Home Component
        <input type="text" onChange={this.handleChange} value="Hello!" />
      </div>
    );
  }
}

export default Home;
