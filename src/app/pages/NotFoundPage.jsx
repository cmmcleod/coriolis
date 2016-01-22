import React from 'react';
import Page from './Page';

/**
 * 404 Page
 */
export default class NotFoundPage extends Page {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      title: 'Page Not Found'
    };
  }

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  render() {
    return <div className={'page'}>Page {JSON.stringify(this.props.context)} Not Found</div>;
  }
}
