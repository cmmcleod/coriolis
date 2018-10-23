import React from 'react';
import Page from './Page';
import AdSense from 'react-adsense';

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
  renderPage() {
    return (
      <div className="page" style={{ marginTop: 30 }}>
        Page <small>{this.context.route.path}</small> Not Found
        <AdSense.Google
          client="ca-pub-3709458261881414"
          slot="4156867783"
          format="auto"
          responsive="true"
        />
      </div>
    );
  }
}
