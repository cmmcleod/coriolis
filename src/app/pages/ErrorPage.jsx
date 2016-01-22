import React from 'react';
import Page from './Page';

/**
 * Unexpected Error page
 * TODO: Implement properly and test
 */
export default class ErrorPage extends Page {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      title: 'Error!'
    };
  }

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  render() {
    let msgPre, msgHighlight, msgPost, errorMessage, details, type;

    switch (type) {
      case 404:
        msgPre = 'Page';
        msgHighlight = this.context.route.path;
        msgPost = 'Not Found';
        break;
      case 'no-ship':
        msgPre = 'Ship';
        msgHighlight = this.props.message;
        msgPost = 'does not exist';
        break;
      case 'build':
        msgPre = 'Build Failure!';
        break;
      default:
        msgPre = 'Uh, Jameson, we have a problem..';
        errorMessage = <div>Message:<pre>{this.props.message}</pre></div>;
    }

    if (this.props.details) {
      details = <div>Details:<br/><pre>{this.props.details}</pre></div>;
    }

    return <div className='error'>
      <h1>
        <span>{msgPre}</span>
        <small>{msgHighlight}</small>
        <span>{msgPost}</span>
      </h1>

      <div style={{ textAlign:'left', fontSize:'0.8em', width: '43em', margin: '0 auto' }}>
        <div className='cen'>
          <a href='https://github.com/cmmcleod/coriolis/issues' target='_blank' title='Coriolis Github Project'>Create an issue on Github</a>
          if this keeps happening. Add these details:
        </div>
        <div style={{ marginTop: '2em' }}>
          <div>Browser: {window.navigator.userAgent}</div>
          <div>Path: {this.context.route.canonicalPath}</div>
          <div>Error:<br/>{this.props.type || 'Unknown'}</div>
          {errorMessage}
          {details}
        </div>
      </div>
    </div>;
  }
}
