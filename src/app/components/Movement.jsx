import React from 'react';
import TranslatedComponent from './TranslatedComponent';

/**
 * Movement
 */
export default class Movement extends TranslatedComponent {
  static propTypes = {
    marker: React.PropTypes.string.isRequired,
    ship: React.PropTypes.object.isRequired,
    boost: React.PropTypes.bool.isRequired,
    eng: React.PropTypes.number.isRequired,
    fuel: React.PropTypes.number.isRequired,
    cargo: React.PropTypes.number.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
  }

  /**
   * Render movement
   * @return {React.Component} contents
   */
  render() {
    const { ship, boost, eng, cargo, fuel } = this.props;
    const { language } = this.context;
    const { formats, translate, units } = language;

    return (
      <span id='movement'>
        <h1>{translate('movement profile')}</h1>
        <svg viewBox='0 0 600 600' fillRule="evenodd" clipRule="evenodd">
          // Axes
          <path d="M150 250v300" strokeWidth='1'/>
          <path d="M150 250l236 236" strokeWidth='1'/>
          <path d="M150 250l350 -200" strokeWidth='1'/>
          // End Arrow
          <path d="M508 43.3L487 67l-10-17.3 31-6.4z"/>
          // Axes arcs and arrows
          <path d="M71.7 251.7C64.2 259.2 60 269.4 60 280c0 22 18 40 40 40s40-18 40-40c0-10.6-4.2-20.8-11.7-28.3 7.5 7.5 11.7 17.7 11.7 28.3 0 22-18 40-40 40s-40-18-40-40c0-10.6 4.2-20.8 11.7-28.3z" strokeWidth='4' transform="matrix(.6 0 0 .3 87.5 376.3)"/>
          <path d="M142.8 453l-13.2 8.7-2.6-9.7 15.8 1z"/>
          <path d="M144.7 451.6l.5 1.6-16.2 10.6h-.4l-3.5-13 .7-.4 19.3 1.2zm-14.2 7.7l7.7-5-9.2-.7 1.5 5.7zm25.7-6.3l15.8-1-2.6 9.7-13.2-8.8z"/>
          <path d="M174 450.8l-3.6 13h-.4l-16.2-10.6.5-1.6 19.3-1.2.3.4zm-13.2 3.4l7.7 5 1.5-5.6-9.2.6z"/>

          <path d="M407.7 119c2 .7 4.3 1 6.4 1 14 0 25-11.2 25-25s-11-25-25-25c-11 0-21 7.6-24 18.5 3-11 13-18.5 24-18.5 14 0 25 11.2 25 25s-11 25-25 25c-2 0-4-.3-6-1z" strokeWidth='2'/>
          <path d="M388 99.7L387 84l9.8 2.5-8.7 13.2z"/>
          <path d="M398.8 85.5l.2.5-10.7 16-1.6-.3-1.2-19.3.4-.3 12.5 3.8zm-9.5 9.7l5-7.7-5.6-1.6.6 9zm10 20.8l15.7-1-2.6 9.7-13.2-8.8z"/>
          <path d="M417 113.8l-3.6 13h-.4l-16.2-10.6.5-1.6 19.3-1.2.3.4zm-13.2 3.4l7.7 5 1.5-5.6-9.2.6z"/>

          <path d="M355 430c0-13.8-11.2-25-25-25s-25 11.2-25 25 11.2 25 25 25c-13.8 0-25-11.2-25-25s11.2-25 25-25 25 11.2 25 25z" strokeWidth='2'/>
          <path d="M357 439.7l-8.8-13 9.7-2.7-1 15.7z"/>
          <path d="M359.5 422.4l-1.2 19.3-1.6.4-10.7-16 .2-.2 13-3.4.3.4zm-9 5l5.2 7.8.6-9.3-5.7 1.2zm-10.5 24l-13.2 8.6-2.6-9.7 15.8 1z"/>
          <path d="M342 450l.4 1.5-16.2 10.7-.4-.2-3.5-13 .3-.3L342 450zm-14.3 7.6l7.7-5-9.2-.6 1.5 5.6z"/>

          // Speed
          <text x="470" y="30" strokeWidth='0'>{formats.int(ship.calcSpeed(eng, fuel, cargo, boost))}m/s</text>
          // Pitch
          <text x="355" y="410" strokeWidth='0'>{formats.int(ship.calcPitch(eng, fuel, cargo, boost))}°/s</text>
          // Roll
          <text x="450" y="110" strokeWidth='0'>{formats.int(ship.calcRoll(eng, fuel, cargo, boost))}°/s</text>
          // Yaw
          <text x="160" y="430" strokeWidth='0'>{formats.int(ship.calcYaw(eng, fuel, cargo, boost))}°/s</text>
        </svg>
      </span>);
  }
}
