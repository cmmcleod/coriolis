import { Component } from 'react';
import Router from 'Router';
import ShipyardPage from 'pages/ShipyardPage';
import NotFoundPage from 'pages/NotFoundPage';
import Header from '../components/Header';

class Coriolis extends Component {

  constructor(props) {
    super(props);
    this.setPage = this.setPage.bind(this);
    this.state.standAlone = isStandAlone();
    window.onerror = errorPage.bind(this);

    Router('/', () => this.setPage(<ShipyardPage />));
    // Router('/outfitting/:ship', outfitting);
    // Router('/outfitting/:ship/:code', outfitting);
    // Router('/compare/:name', compare);
    // Router('/comparison/:code', comparison);
    // Router('/settings', settings);
    Router('*', () => this.setPage(null));

    if (window.applicationCache) {
      // Listen for appcache updated event, present refresh to update view
      window.applicationCache.addEventListener('updateready', () => {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          this.setState({appCacheUpdate: true});
        }
      }, false);
    }

    Router.start();
    console.log('Root page created');
  }

  setPage(page) {
    this.setState({ page: page });
  }

  onError(msg, scriptUrl, line, col, errObj) {
    this.setPage(<div>Some errors occured!!</div>);
  }

  render() {
    return (
      <div>
        {/* <Header appCacheUpdate={appCacheUpdate} /> */}
        {this.state.page || <NotFoundPage />}
      </div>
    );
  }
}

ReactDOM.render(<Coriolis />, document.getElementById('coriolis'));
