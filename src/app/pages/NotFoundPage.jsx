import React from 'react';
import Page from './Page';

export default class NotFoundPage extends Page {

  constructor(props) {
    super(props);
    this.state = {
      title: 'Page Not Found'
    };
  }

  render() {
    return <div className={'page'}>Page {JSON.stringify(this.props.context)} Not Found</div>;
  }
}
