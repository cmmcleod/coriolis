import React from 'react';
import Page from './Page';
import { CoriolisLogo, GitHub } from '../components/SvgIcons';

/**
 * About Page
 */
export default class AboutPage extends Page {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      title: 'About Coriolis'
    };
  }

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  renderPage() {
    return <div className={'page'} style={{ textAlign: 'left', maxWidth: 800, margin: '0 auto' }}>
      <h1><CoriolisLogo style={{ marginRight: '0.4em' }} className='xl'/><span className='warning'>Coriolis EDCD Edition</span></h1>

      <p>This is a clone of the Coriolis project, whose original author is currently unable to maintain it. This clone is maintained by the <a href="http://edcd.github.io/">EDCD community</a>.</p>
      <p>To recover your builds, go to <a href='https://coriolis.io/' target='_blank'>https://coriolis.io/</a>, backup your builds (Settings / Backup), copy the text, return here and import (Settings / Import).</p>
      <p>The Coriolis project was inspired by <a href='http://www.edshipyard.com/' target='_blank'>E:D Shipyard</a> and, of course, <a href='http://www.elitedangerous.com' target='_blank'>Elite Dangerous</a>. The ultimate goal of Coriolis is to provide rich features to support in-game play and planning while engaging the E:D community to support its development.</p>
      <p>Coriolis was created using assets and imagery from Elite: Dangerous, with the permission of Frontier Developments plc, for non-commercial purposes. It is not endorsed by nor reflects the views or opinions of Frontier Developments.  A number of assets were sourced from <a href='http://edassets.org' target='_blank'>ED Assets</a></p>

      <a style={{ display: 'block', textDecoration: 'none' }} href='https://github.com/EDCD/coriolis' target='_blank' title='Coriolis Github Project'>
        <GitHub style={{ margin: '0.4em' }} className='l fg xl'/>
        <h2 style={{ margin: 0, textDecoration: 'none' }}>Github</h2>
        github.com/EDCD/coriolis
      </a>

      <p>Coriolis is an open source project. Checkout the list of upcoming features and to-do list on github. Any and all contributions and feedback are welcome. If you encounter any bugs please report them and provide as much detail as possible.</p>

      <form action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_blank'>
        <input type='hidden' name='cmd' value='_s-xclick' />
        <input type='hidden' name='encrypted' value='-----BEGIN PKCS7-----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-----END PKCS7-----' />
        <input type='image' src='https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif' name='submit' alt='PayPal - Donate to Coriolis.io' style={{ border:'none' }} />
        <img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1' />
      </form>

      <p>Help keep the lights on! Donations will be used to cover costs of running and maintaining Coriolis. Thanks for helping!</p>

      <h3>Chat</h3>
      <p>You can chat to us on our <a href='https://discord.gg/0uwCh6R62aPRjk9w' target='_blank'>EDCD Discord server</a>.</p>
    </div>;
  }
}
