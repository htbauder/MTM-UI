import React from 'react';

/**
 * About component shows information about the contact information
 */
export default class About extends React.Component {
  
  render() {
    return (
      <div>
        <div className = "container">
          <div className = "row">
            <div className = "col-lg-12 text center">
              <h1> About </h1>
            </div>
            <div className = "col-lg-12 text center">
              <p> You can find more information here: serrano@ualberta.ca </p>  
            </div>
          </div>
        </div>
      </div>
    );
  }
  
}
