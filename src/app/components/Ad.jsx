import React, { Component, PropTypes } from 'react';

export default class Ad extends Component {
  static propTypes = {
    client: PropTypes.string,
    slot: PropTypes.string,
    format: PropTypes.string,
    wrapperDivStyle: PropTypes.object
  };
  constructor(props) {
    super(props);
  }
  // This code is ran when the component mounts
  componentDidMount() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }

  // an outer div for styling purposes
  // changed class to ClassName
  // changed style from string to an object

  render() {
    return (
      <div style={this.props.wrapperDivStyle}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={this.props.client}
          data-ad-slot={this.props.slot}
          data-ad-format={this.props.format}
        />
      </div>
    );
  }
}
