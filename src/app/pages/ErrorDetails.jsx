import React from 'react';
import PropTypes from 'prop-types';

/**
 * Unexpected Error page / block
 */
export default class ErrorDetails extends React.Component {

  static contextTypes = {
    route: PropTypes.object.isRequired,
    language: PropTypes.object.isRequired
  };

  static propTypes = {
    error: PropTypes.object.isRequired
  };

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  render() {
    let content = null;
    let error = this.props.error;
    let ed = error.details;

    if (ed) {
      content = <div style={{ textAlign:'left', fontSize:'0.8em', width: '43em', margin: '0 auto' }}>
        <div className='cen'>
          <a href='https://github.com/edcd/coriolis/issues' target='_blank' title='Coriolis Github Project'>Create an issue on Github</a>
          {' if this keeps happening. Add these details:'}
        </div>
        <div style={{ marginTop: '2em' }}>
          <div><span className='warning'>Browser:</span> {window.navigator.userAgent}</div>
          <div><span className='warning'>Path:</span> {this.context.route.canonicalPath}</div>
          <div><span className='warning'>Error:</span> {error.type || 'Unknown'}</div>
          <div className='warning'>Details:</div>
          <div><pre>{typeof ed == 'object' ? Object.keys(ed).map((e) => `${e}: ${ed[e]}\n`) : ed}</pre></div>
        </div>
      </div>;
    }

    const importerror = ed && ed.scriptUrl && ed.scriptUrl.indexOf('/import') != -1;

    return <div className='error'>
      <h1>Jameson, we have a problem..</h1>
      <h1><small>{error.message}</small></h1>
      <br/>
        {importerror ? <div>If you are attempting to import a ship from EDDI or EDMC and are seeing a 'Z_BUF_ERROR' it means that the URL has not been provided correctly.  This is a common problem when using Microsoft Internet Explorer or Microsoft Edge, and you should use another browser instead.</div> : null }
      <br/>
      <div>Please note that this site uses Google Analytics to track performance and usage.  If you are blocking cookies, for example using Ghostery, please disable blocking for this site and try again.</div>
      <br/>
      {content}
    </div>;
  }
}
