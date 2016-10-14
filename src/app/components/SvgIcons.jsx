import React from 'react';
import cn from 'classnames';
import { shallowEqual } from '../utils/UtilityFunctions';

/**
 * Base SVG Icon Component
 */
class SvgIcon extends React.Component {

  static propTypes = {
    className: React.PropTypes.any,
    style: React.PropTypes.object
  };

  /**
   * Only rerender an SVG Icon if properties have changed
   * @param  {Object} nextProps   Next/Incoming properties
   * @return {Boolean}            True if properties have changed
   */
  shouldComponentUpdate(nextProps) { return !shallowEqual(this.props, nextProps); }

  /**
   * Standard SVG view box, can/should be overriden by sub-classes as necessary
   * @return {String} view box string
   */
  viewBox() { return '0 0 32 32'; }

  /**
   * Render the Icon
   * @return {React.Component} SVG Icon
   */
  render() {
    return (
      <svg className={cn('icon', this.props.className)} style={this.props.style} viewBox={this.viewBox()}>
        {this.svg()}
      </svg>
    );
  }
}

/**
 * Bin Icon - Delete
 */
export class Bin extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M4 10v20c0 1.1 0.9 2 2 2h18c1.1 0 2-0.9 2-2v-20h-22zM10 28h-2v-14h2v14zM14 28h-2v-14h2v14zM18 28h-2v-14h2v14zM22 28h-2v-14h2v14z'/>
      <path d='M26.5 4h-6.5v-2.5c0-0.825-0.675-1.5-1.5-1.5h-7c-0.825 0-1.5 0.675-1.5 1.5v2.5h-6.5c-0.825 0-1.5 0.675-1.5 1.5v2.5h26v-2.5c0-0.825-0.675-1.5-1.5-1.5zM18 4h-6v-1.975h6v1.975z'/>
    </g>;
  }
}

/**
 * Coriolis Logo
 */
export class CoriolisLogo extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g transform='translate(1,1)'>
      <path stroke='#0a8bd6' transform='rotate(45 15 15)' d='m4,4 l 11,-4 l 11,4 l 4,11 l -4,11 l -11,4 l -11,-4 l -4,-11 l 4,-11 l 22,0 l 0,22 l -22,0 z' strokeWidth='1' fill='#000000'/>
      <rect height='3' width='10' y='13.5' x='10' strokeWidth='1' stroke='#0a8bd6'/>
    </g>;
  }
}

/**
 * Download  / To Inbox
 */
export class Download extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M16 18l8-8h-6v-8h-4v8h-6zM23.273 14.727l-2.242 2.242 8.128 3.031-13.158 4.907-13.158-4.907 8.127-3.031-2.242-2.242-8.727 3.273v8l16 6 16-6v-8z'/>;
  }
}

/**
 * Eddb.io Logo
 */
export class Eddb extends SvgIcon {
  /**
   * Render the Icon
   * @return {React.Component} SVG Icon
   */
  render() {
    return <svg className={cn(this.props.className)} style={this.props.style} viewBox='0 0 90 32'>
      <path d='M19.1,25.2c0.3,0,0.6,0.1,0.7,0.2c0.2,0.1,0.3,0.3,0.4,0.4c0.1,0.2,0.2,0.4,0.2,0.6v3.3c0,0.3-0.1,0.6-0.2,0.7c-0.1,0.2-0.3,0.3-0.4,0.3c-0.2,0.1-0.4,0.2-0.6,0.1H3.6c-0.3,0-0.6-0.1-0.7-0.2c-0.2-0.1-0.3-0.3-0.3-0.4c-0.1-0.2-0.2-0.4-0.1-0.6V10.2c0-0.3,0.1-0.5,0.2-0.7C2.7,9.4,2.9,9.3,3,9.2C3.2,9.1,3.4,9,3.6,9h15.5c0.3,0,0.6,0.1,0.7,0.2c0.2,0.1,0.3,0.3,0.4,0.4c0.1,0.2,0.2,0.4,0.2,0.6V22c0,0.3-0.1,0.6-0.2,0.7c-0.1,0.2-0.3,0.3-0.4,0.3c-0.2,0.1-0.4,0.2-0.6,0.1h-6.8v-6.8c0.3-0.2,0.6-0.4,0.8-0.7c0.2-0.3,0.3-0.7,0.3-1c0-0.6-0.2-1.1-0.6-1.4c-0.4-0.4-0.9-0.6-1.4-0.6c-0.5,0-1,0.2-1.4,0.6c-0.4,0.4-0.6,0.9-0.6,1.4c0,0.8,0.3,1.4,1,1.8v8.7H19.1z'/>
      <path d='M24.6,29.7V10.2c0-0.2,0-0.4,0.1-0.6c0.1-0.1,0.2-0.3,0.3-0.4C25.3,9.1,25.5,9,25.8,9h5.5c0.2,0,0.4,0.1,0.6,0.2c0.1,0.1,0.3,0.2,0.4,0.3c0.1,0.1,0.2,0.4,0.2,0.7v13.2c-0.7,0.4-1,1-1,1.8c0,0.5,0.2,1,0.6,1.4c0.4,0.4,0.9,0.6,1.4,0.6c0.6,0,1.1-0.2,1.4-0.6c0.4-0.4,0.6-0.9,0.6-1.4c0-0.4-0.1-0.8-0.3-1.1c-0.2-0.3-0.4-0.5-0.8-0.7V2.3c0-0.2,0-0.4,0.1-0.6c0.1-0.1,0.2-0.3,0.3-0.4C35.2,1.1,35.4,1,35.8,1h5.5c0.2,0,0.4,0.1,0.6,0.2c0.1,0.1,0.3,0.2,0.4,0.4c0.1,0.2,0.2,0.4,0.2,0.7v27.4c0,0.2-0.1,0.4-0.2,0.6c-0.1,0.1-0.2,0.3-0.4,0.4c-0.2,0.1-0.4,0.2-0.7,0.2H25.8c-0.2,0-0.4,0-0.6-0.1c-0.1-0.1-0.3-0.2-0.4-0.3C24.7,30.3,24.6,30,24.6,29.7z'/>
      <path d='M46.9,29.7V10.2c0-0.2,0-0.4,0.1-0.6c0.1-0.1,0.2-0.3,0.3-0.4C47.5,9.1,47.7,9,48.1,9h5.5c0.2,0,0.4,0.1,0.6,0.2c0.1,0.1,0.3,0.2,0.4,0.3c0.1,0.1,0.2,0.4,0.2,0.7v13.2c-0.7,0.4-1,1-1,1.8c0,0.5,0.2,1,0.6,1.4c0.4,0.4,0.9,0.6,1.4,0.6c0.6,0,1.1-0.2,1.4-0.6c0.4-0.4,0.6-0.9,0.6-1.4c0-0.4-0.1-0.8-0.3-1.1c-0.2-0.3-0.4-0.5-0.8-0.7V2.3c0-0.2,0-0.4,0.1-0.6c0.1-0.1,0.2-0.3,0.3-0.4C57.4,1.1,57.7,1,58,1h5.5c0.2,0,0.4,0.1,0.6,0.2c0.1,0.1,0.3,0.2,0.4,0.4c0.1,0.2,0.2,0.4,0.2,0.7v27.4c0,0.2-0.1,0.4-0.2,0.6c-0.1,0.1-0.2,0.3-0.4,0.4s-0.4,0.2-0.7,0.2H48.1c-0.2,0-0.4,0-0.6-0.1c-0.1-0.1-0.3-0.2-0.4-0.3C46.9,30.3,46.9,30,46.9,29.7z'/>
      <path d='M87,29.7c0,0.3-0.1,0.6-0.2,0.7c-0.1,0.2-0.3,0.3-0.4,0.3c-0.2,0.1-0.4,0.2-0.6,0.1H70.3c-0.3,0-0.6-0.1-0.7-0.2s-0.3-0.3-0.3-0.4c-0.1-0.2-0.2-0.4-0.1-0.6V2.3c0-0.3,0.1-0.6,0.2-0.7c0.1-0.2,0.3-0.3,0.4-0.4C69.9,1.1,70.1,1,70.3,1h5.5c0.3,0,0.6,0.1,0.7,0.2c0.2,0.1,0.3,0.3,0.4,0.4c0.1,0.2,0.2,0.4,0.2,0.6v21.2c-0.7,0.4-1,1-1,1.8c0,0.5,0.2,1,0.6,1.4c0.4,0.4,0.8,0.6,1.4,0.6c0.6,0,1.1-0.2,1.4-0.6c0.4-0.4,0.6-0.9,0.6-1.4c0-0.4-0.1-0.8-0.3-1.1c-0.2-0.3-0.4-0.5-0.8-0.7V10.2c0-0.3,0.1-0.5,0.2-0.7c0.1-0.1,0.3-0.3,0.4-0.3C79.8,9.1,80,9,80.2,9h5.5c0.3,0,0.6,0.1,0.7,0.2c0.2,0.1,0.3,0.3,0.4,0.4C87,9.8,87,10,87,10.2V29.7z'/>
    </svg>;
  }
}

/**
 * Embed - <>
 */
export class Embed extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M18 23l3 3 10-10-10-10-3 3 7 7z'/>
      <path d='M14 9l-3-3-10 10 10 10 3-3-7-7z'/>
    </g>;
  }
}

/**
 * Equalizer
 */
export class Equalizer extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 1024 1024'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M448 128v-16c0-26.4-21.6-48-48-48h-160c-26.4 0-48 21.6-48 48v16h-192v128h192v16c0 26.4 21.6 48 48 48h160c26.4 0 48-21.6 48-48v-16h576v-128h-576zM256 256v-128h128v128h-128zM832 432c0-26.4-21.6-48-48-48h-160c-26.4 0-48 21.6-48 48v16h-576v128h576v16c0 26.4 21.6 48 48 48h160c26.4 0 48-21.6 48-48v-16h192v-128h-192v-16zM640 576v-128h128v128h-128zM448 752c0-26.4-21.6-48-48-48h-160c-26.4 0-48 21.6-48 48v16h-192v128h192v16c0 26.4 21.6 48 48 48h160c26.4 0 48-21.6 48-48v-16h576v-128h-576v-16zM256 896v-128h128v128h-128z'/>
    </g>;
  }
}

/**
 * Floppy disk - save
 */
export class FloppyDisk extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M28 0h-28v32h32v-28l-4-4zM16 4h4v8h-4v-8zM28 28h-24v-24h2v10h18v-10h2.343l1.657 1.657v22.343z' />;
  }
}

/**
 * Fuel Gauge
 */
export class Fuel extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM9.464 26.067c0.347-0.957 0.536-1.99 0.536-3.067 0-3.886-2.463-7.197-5.913-8.456 0.319-2.654 1.508-5.109 3.427-7.029 2.267-2.266 5.28-3.515 8.485-3.515s6.219 1.248 8.485 3.515c1.92 1.92 3.108 4.375 3.428 7.029-3.45 1.26-5.913 4.57-5.913 8.456 0 1.077 0.189 2.11 0.536 3.067-1.928 1.258-4.18 1.933-6.536 1.933s-4.608-0.675-6.536-1.933zM17.242 20.031c0.434 0.109 0.758 0.503 0.758 0.969v2c0 0.55-0.45 1-1 1h-2c-0.55 0-1-0.45-1-1v-2c0-0.466 0.324-0.86 0.758-0.969l0.742-14.031h1l0.742 14.031z' />;
  }
}

/**
 * Github Logo
 */
export class GitHub extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 1024 1024'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M512 0C229.252 0 0 229.25199999999995 0 512c0 226.251 146.688 418.126 350.155 485.813 25.593 4.686 34.937-11.125 34.937-24.626 0-12.188-0.469-52.562-0.718-95.314-128.708 23.46-161.707-31.541-172.469-60.373-5.525-14.809-30.407-60.249-52.398-72.263-17.988-9.828-43.26-33.237-0.917-33.735 40.434-0.476 69.348 37.308 78.471 52.75 45.938 77.749 119.876 55.627 148.999 42.5 4.654-32.999 17.902-55.627 32.501-68.373-113.657-12.939-233.22-56.875-233.22-253.063 0-55.94 19.968-101.561 52.658-137.404-5.22-12.999-22.844-65.095 5.063-135.563 0 0 42.937-13.749 140.811 52.501 40.811-11.406 84.594-17.031 128.124-17.22 43.499 0.188 87.314 5.874 128.188 17.28 97.689-66.311 140.686-52.501 140.686-52.501 28 70.532 10.375 122.564 5.124 135.499 32.811 35.844 52.626 81.468 52.626 137.404 0 196.686-119.751 240-233.813 252.686 18.439 15.876 34.748 47.001 34.748 94.748 0 68.437-0.686 123.627-0.686 140.501 0 13.625 9.312 29.561 35.25 24.562C877.436 929.998 1024 738.126 1024 512 1024 229.25199999999995 794.748 0 512 0z' />;
  }
}

/**
 * Infinite / Infinity
 */
export class Infinite extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M24.5 23.5c-2.003 0-3.887-0.78-5.303-2.197l-3.197-3.196-3.196 3.196c-1.417 1.417-3.3 2.197-5.303 2.197s-3.887-0.78-5.304-2.197c-1.417-1.417-2.197-3.3-2.197-5.303s0.78-3.887 2.197-5.304c1.417-1.417 3.3-2.197 5.304-2.197s3.887 0.78 5.303 2.197l3.196 3.196 3.196-3.196c1.417-1.417 3.3-2.197 5.303-2.197s3.887 0.78 5.303 2.197c1.417 1.417 2.197 3.3 2.197 5.304s-0.78 3.887-2.197 5.303c-1.416 1.417-3.3 2.197-5.303 2.197zM21.304 19.197c0.854 0.853 1.989 1.324 3.196 1.323s2.342-0.47 3.196-1.324c0.854-0.854 1.324-1.989 1.324-3.196s-0.47-2.342-1.324-3.196c-0.854-0.854-1.989-1.324-3.196-1.324s-2.342 0.47-3.196 1.324l-3.196 3.196 3.196 3.197zM7.5 11.48c-1.207 0-2.342 0.47-3.196 1.324s-1.324 1.989-1.324 3.196c0 1.207 0.47 2.342 1.324 3.196s1.989 1.324 3.196 1.324c1.207 0 2.342-0.47 3.196-1.324l3.196-3.196-3.196-3.196c-0.854-0.854-1.989-1.324-3.196-1.324v0z'/>;
  }
}

/**
 * Info - i within circle
 */
export class Info extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M14 9.5c0-0.825 0.675-1.5 1.5-1.5h1c0.825 0 1.5 0.675 1.5 1.5v1c0 0.825-0.675 1.5-1.5 1.5h-1c-0.825 0-1.5-0.675-1.5-1.5v-1z'/>
      <path d='M20 24h-8v-2h2v-6h-2v-2h6v8h2z'/>
      <path d='M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13z'/>
    </g>;
  }
}

/**
 * Link / Permalink / Chain
 */
export class LinkIcon extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M13.757 19.868c-0.416 0-0.832-0.159-1.149-0.476-2.973-2.973-2.973-7.81 0-10.783l6-6c1.44-1.44 3.355-2.233 5.392-2.233s3.951 0.793 5.392 2.233c2.973 2.973 2.973 7.81 0 10.783l-2.743 2.743c-0.635 0.635-1.663 0.635-2.298 0s-0.635-1.663 0-2.298l2.743-2.743c1.706-1.706 1.706-4.481 0-6.187-0.826-0.826-1.925-1.281-3.094-1.281s-2.267 0.455-3.094 1.281l-6 6c-1.706 1.706-1.706 4.481 0 6.187 0.635 0.635 0.635 1.663 0 2.298-0.317 0.317-0.733 0.476-1.149 0.476z'/>
      <path d='M8 31.625c-2.037 0-3.952-0.793-5.392-2.233-2.973-2.973-2.973-7.81 0-10.783l2.743-2.743c0.635-0.635 1.664-0.635 2.298 0s0.635 1.663 0 2.298l-2.743 2.743c-1.706 1.706-1.706 4.481 0 6.187 0.826 0.826 1.925 1.281 3.094 1.281s2.267-0.455 3.094-1.281l6-6c1.706-1.706 1.706-4.481 0-6.187-0.635-0.635-0.635-1.663 0-2.298s1.663-0.635 2.298 0c2.973 2.973 2.973 7.81 0 10.783l-6 6c-1.44 1.44-3.355 2.233-5.392 2.233z'/>
    </g>;
  }
}

/**
 * No Power - Lightning bolt + no entry
 */
export class NoPower extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 512 512'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M437.020 74.98c-48.353-48.351-112.64-74.98-181.020-74.98s-132.667 26.629-181.020 74.98c-48.351 48.353-74.98 112.64-74.98 181.020s26.629 132.667 74.98 181.020c48.353 48.351 112.64 74.98 181.020 74.98s132.667-26.629 181.020-74.98c48.351-48.353 74.98-112.64 74.98-181.020s-26.629-132.667-74.98-181.020zM448 256c0 41.407-13.177 79.794-35.556 111.19l-267.633-267.634c31.396-22.379 69.782-35.556 111.189-35.556 105.869 0 192 86.131 192 192zM64 256c0-41.407 13.177-79.793 35.556-111.189l267.635 267.634c-31.397 22.378-69.784 35.555-111.191 35.555-105.869 0-192-86.131-192-192z'/>;
  }
}

/**
 * Notification - Exclamation mark within circle
 */
export class Notification extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M16 3c-3.472 0-6.737 1.352-9.192 3.808s-3.808 5.72-3.808 9.192c0 3.472 1.352 6.737 3.808 9.192s5.72 3.808 9.192 3.808c3.472 0 6.737-1.352 9.192-3.808s3.808-5.72 3.808-9.192c0-3.472-1.352-6.737-3.808-9.192s-5.72-3.808-9.192-3.808zM16 0v0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-8.837 0-16-7.163-16-16s7.163-16 16-16zM14 22h4v4h-4zM14 6h4v12h-4z'/>;
  }
}

/**
 * Power - Lightning Bolt
 */
export class Power extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 512 512'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M192 0l-192 256h192l-128 256 448-320h-256l192-192z'/>;
  }
}

/**
 * Question mark within Circle
 */
export class Question extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M14 22h4v4h-4zM22 8c1.105 0 2 0.895 2 2v6l-6 4h-4v-2l6-4v-2h-10v-4h12zM16 3c-3.472 0-6.737 1.352-9.192 3.808s-3.808 5.72-3.808 9.192c0 3.472 1.352 6.737 3.808 9.192s5.72 3.808 9.192 3.808c3.472 0 6.737-1.352 9.192-3.808s3.808-5.72 3.808-9.192c0-3.472-1.352-6.737-3.808-9.192s-5.72-3.808-9.192-3.808zM16 0v0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-8.837 0-16-7.163-16-16s7.163-16 16-16z'/>;
  }
}

/**
 * Reload - Clockwise circular arrow
 */
export class Reload extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M32 12h-12l4.485-4.485c-2.267-2.266-5.28-3.515-8.485-3.515s-6.219 1.248-8.485 3.515c-2.266 2.267-3.515 5.28-3.515 8.485s1.248 6.219 3.515 8.485c2.267 2.266 5.28 3.515 8.485 3.515s6.219-1.248 8.485-3.515c0.189-0.189 0.371-0.384 0.546-0.583l3.010 2.634c-2.933 3.349-7.239 5.464-12.041 5.464-8.837 0-16-7.163-16-16s7.163-16 16-16c4.418 0 8.418 1.791 11.313 4.687l4.687-4.687v12z'/>;
  }
}

/**
 * Warning - Exclamation point witin triangle
 */
export class Warning extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M16 2.899l13.409 26.726h-26.819l13.409-26.726zM16 0c-0.69 0-1.379 0.465-1.903 1.395l-13.659 27.222c-1.046 1.86-0.156 3.383 1.978 3.383h27.166c2.134 0 3.025-1.522 1.978-3.383h0l-13.659-27.222c-0.523-0.93-1.213-1.395-1.903-1.395v0z'/>
      <path d='M18 26c0 1.105-0.895 2-2 2s-2-0.895-2-2c0-1.105 0.895-2 2-2s2 0.895 2 2z'/>
      <path d='M16 22c-1.105 0-2-0.895-2-2v-6c0-1.105 0.895-2 2-2s2 0.895 2 2v6c0 1.105-0.895 2-2 2z'/>
    </g>;
  }
}

/**
 * Thermal damage
 */
export class DamageThermal extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <ellipse cx='100' cy='100' rx='90' ry='90' fillOpacity='0' />
      <ellipse cx='100' cy='100' rx='30' ry='30' fillOpacity='1' />
      <path d='M100 20v80' />
    </g>;
  }
}

/**
 * Kinetic damage
 */
export class DamageKinetic extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <ellipse cx='100' cy='100' rx='90' ry='90' fillOpacity='0' />
      <ellipse cx='62' cy='67' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='62' cy='101' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='62' cy='135' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='50' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='84' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='118' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='152' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='138' cy='67' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='138' cy='101' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='138' cy='135' rx='5' ry='5' fillOpacity='1' />
    </g>;
  }
}

/**
 * Explosive damage
 */
export class DamageExplosive extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <ellipse cx='100' cy='100' rx='50' ry='50' fillOpacity='0' />
      <ellipse cx='100' cy='20' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='156.57' cy='36.57' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='180' cy='100' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='156.57' cy='163.43' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='180' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='43.43' cy='163.43' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='20' cy='100' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='43.43' cy='36.57' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='75' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='125' cy='100' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='100' cy='125' rx='5' ry='5' fillOpacity='1' />
      <ellipse cx='75' cy='100' rx='5' ry='5' fillOpacity='1' />
    </g>;
  }
}

/**
 * Fixed mount hardpoint
 */
export class MountFixed extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <circle cx='100' cy='100' r='76' fillOpacity='0' />
      <path d='M0 100h48' />
      <path d='M152 100h48' />
      <path d='M100 0v48' />
      <path d='M100 152v48' />
    </g>;
  }
}

/**
 * Gimballed mount hardpoint
 */
export class MountGimballed extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <ellipse cx='100' cy='100' rx='90' ry='25' fillOpacity='0' />
      <ellipse cx='100' cy='100' rx='20' ry='95' fillOpacity='0' />
    </g>;
  }
}

/**
 * Turrent mount hardpoint
 */
export class MountTurret extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M40 50 A 40 40 0 0 0 0 90' />
      <path d='M40 50h40' />
      <path d='M120 90 A 40 40 0 0 0 80 50' />
      <path d='M0 90v40' />
      <path d='M120 90v40' />
      <path d='M0 120h120' />
      <path d='M120 90h80' />
      <path d='M0 160h120' />
    </g>;
  }
}

/**
 * Rocket ship
 */
export class Rocket extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M22 2l-10 10h-6l-6 8c0 0 6.357-1.77 10.065-0.94l-10.065 12.94 13.184-10.255c1.839 4.208-1.184 10.255-1.184 10.255l8-6v-6l10-10 2-10-10 2z'/>;
  }
}

/**
 * Hammer
 */
export class Hammer extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M31.562 25.905l-9.423-9.423c-0.583-0.583-1.538-0.583-2.121 0l-0.707 0.707-5.75-5.75 9.439-9.439h-10l-4.439 4.439-0.439-0.439h-2.121v2.121l0.439 0.439-6.439 6.439 5 5 6.439-6.439 5.75 5.75-0.707 0.707c-0.583 0.583-0.583 1.538 0 2.121l9.423 9.423c0.583 0.583 1.538 0.583 2.121 0l3.535-3.535c0.583-0.583 0.583-1.538 0-2.121z'/>;
  }
}

/**
 * Stats bars / Histogram / Compare
 */
export class StatsBars extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M0 26h32v4h-32zM4 18h4v6h-4zM10 10h4v14h-4zM16 16h4v8h-4zM22 4h4v20h-4z'/>;
  }
}

/**
 * Cogs / Settings
 */
export class Cogs extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M11.366 22.564l1.291-1.807-1.414-1.414-1.807 1.291c-0.335-0.187-0.694-0.337-1.071-0.444l-0.365-2.19h-2l-0.365 2.19c-0.377 0.107-0.736 0.256-1.071 0.444l-1.807-1.291-1.414 1.414 1.291 1.807c-0.187 0.335-0.337 0.694-0.443 1.071l-2.19 0.365v2l2.19 0.365c0.107 0.377 0.256 0.736 0.444 1.071l-1.291 1.807 1.414 1.414 1.807-1.291c0.335 0.187 0.694 0.337 1.071 0.444l0.365 2.19h2l0.365-2.19c0.377-0.107 0.736-0.256 1.071-0.444l1.807 1.291 1.414-1.414-1.291-1.807c0.187-0.335 0.337-0.694 0.444-1.071l2.19-0.365v-2l-2.19-0.365c-0.107-0.377-0.256-0.736-0.444-1.071zM7 27c-1.105 0-2-0.895-2-2s0.895-2 2-2 2 0.895 2 2-0.895 2-2 2zM32 12v-2l-2.106-0.383c-0.039-0.251-0.088-0.499-0.148-0.743l1.799-1.159-0.765-1.848-2.092 0.452c-0.132-0.216-0.273-0.426-0.422-0.629l1.219-1.761-1.414-1.414-1.761 1.219c-0.203-0.149-0.413-0.29-0.629-0.422l0.452-2.092-1.848-0.765-1.159 1.799c-0.244-0.059-0.492-0.109-0.743-0.148l-0.383-2.106h-2l-0.383 2.106c-0.251 0.039-0.499 0.088-0.743 0.148l-1.159-1.799-1.848 0.765 0.452 2.092c-0.216 0.132-0.426 0.273-0.629 0.422l-1.761-1.219-1.414 1.414 1.219 1.761c-0.149 0.203-0.29 0.413-0.422 0.629l-2.092-0.452-0.765 1.848 1.799 1.159c-0.059 0.244-0.109 0.492-0.148 0.743l-2.106 0.383v2l2.106 0.383c0.039 0.251 0.088 0.499 0.148 0.743l-1.799 1.159 0.765 1.848 2.092-0.452c0.132 0.216 0.273 0.426 0.422 0.629l-1.219 1.761 1.414 1.414 1.761-1.219c0.203 0.149 0.413 0.29 0.629 0.422l-0.452 2.092 1.848 0.765 1.159-1.799c0.244 0.059 0.492 0.109 0.743 0.148l0.383 2.106h2l0.383-2.106c0.251-0.039 0.499-0.088 0.743-0.148l1.159 1.799 1.848-0.765-0.452-2.092c0.216-0.132 0.426-0.273 0.629-0.422l1.761 1.219 1.414-1.414-1.219-1.761c0.149-0.203 0.29-0.413 0.422-0.629l2.092 0.452 0.765-1.848-1.799-1.159c0.059-0.244 0.109-0.492 0.148-0.743l2.106-0.383zM21 15.35c-2.402 0-4.35-1.948-4.35-4.35s1.948-4.35 4.35-4.35 4.35 1.948 4.35 4.35c0 2.402-1.948 4.35-4.35 4.35z'/>;
  }
}

/**
 * Power Switch - Reset
 */
export class Switch extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M20 4.581v4.249c1.131 0.494 2.172 1.2 3.071 2.099 1.889 1.889 2.929 4.4 2.929 7.071s-1.040 5.182-2.929 7.071c-1.889 1.889-4.4 2.929-7.071 2.929s-5.182-1.040-7.071-2.929c-1.889-1.889-2.929-4.4-2.929-7.071s1.040-5.182 2.929-7.071c0.899-0.899 1.94-1.606 3.071-2.099v-4.249c-5.783 1.721-10 7.077-10 13.419 0 7.732 6.268 14 14 14s14-6.268 14-14c0-6.342-4.217-11.698-10-13.419zM14 0h4v16h-4z'/>;
  }
}

/**
 * In-game Coriolis Station logo
 */
export class StationCoriolis extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <rect x='73.001' y='94.017' width='53.997' height='11.945'/>
      <path d='M10.324,185.445l89.217,14.348l0.458,0.077l89.677-14.43L200,99.998l-10.338-89.765L100,0.129L10.34,10.233   L-0.001,99.986L10.324,185.445z M193.206,99.986L100,191.108L6.795,99.986L100,8.868L193.206,99.986z M6.82,107.775l87.583,85.624   l-78.983-12.702L6.82,107.775z M184.583,180.692l-78.992,12.712l87.587-85.634L184.583,180.692z M193.745,92.746L105.26,6.245l79.339,8.938L193.745,92.746z M15.41,15.185L94.736,6.25L6.255,92.751L15.41,15.185z'/>
    </g>;
  }
}

/**
 * In-game Ocellus Station logo
 */
export class StationOcellus extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M100.002,200C155.139,200,200,155.142,200,100.001c0-55.143-44.861-100.002-99.998-100.002C44.86-0.001-0.002,44.857-0.002,100.001C-0.001,155.142,44.86,200,100.002,200z M100.002,5.574c52.063,0,94.423,42.359,94.423,94.427c0,52.067-42.361,94.422-94.423,94.422c-52.07,0-94.428-42.358-94.428-94.422C5.574,47.933,47.933,5.574,100.002,5.574z'/>
      <path d='M100.002,148.557c26.771,0,48.558-21.783,48.558-48.555c0-26.771-21.786-48.556-48.558-48.556c-26.777,0-48.557,21.782-48.557,48.556C51.446,126.778,73.225,148.557,100.002,148.557z M100.002,57.015c23.699,0,42.986,19.283,42.986,42.986c0,23.7-19.282,42.987-42.986,42.987c-23.705,0-42.991-19.282-42.991-42.987C57.011,76.298,76.302,57.015,100.002,57.015z'/>
      <rect x='73.404' y='93.985' width='53.197' height='12.033'/>
    </g>;
  }
}

/**
 * In-game Orbis Station logo
 */
export class StationOrbis extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M100.002,200c55.138,0,99.996-44.861,99.996-100c0-55.141-44.858-100-99.996-100C44.861,0-0.001,44.857-0.001,100C0,155.139,44.861,200,100.002,200z M100.002,194.424c-35.465,0-66.413-19.663-82.552-48.651l44.426-23.388c7.704,13.067,21.888,21.884,38.127,21.884c16.054,0,30.096-8.621,37.853-21.446l44.441,23.389C166.092,174.961,135.282,194.424,100.002,194.424zM100.002,61.306c21.335,0,38.691,17.356,38.691,38.694c0,21.338-17.364,38.691-38.691,38.691c-21.339,0-38.696-17.354-38.696-38.691C61.307,78.662,78.663,61.306,100.002,61.306zM194.422,100c0,14.802-3.427,28.808-9.521,41.287l-44.447-23.4c2.433-5.477,3.812-11.521,3.812-17.89c0-23.578-18.539-42.852-41.8-44.145V5.636C153.392,6.956,194.422,48.762,194.422,100z M96.895,5.655v50.233C73.938,57.491,55.73,76.635,55.73,100c0,6.187,1.286,12.081,3.592,17.434l-44.455,23.402C8.911,128.472,5.571,114.619,5.571,100C5.577,48.972,46.261,7.297,96.895,5.655z'/>
      <rect x='73.403' y='93.983' width='53.196' height='12.032'/>
    </g>;
  }
}

/**
 * In-game Outpost Station logo
 */
export class StationOutpost extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 200 200'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g>
      <path d='M145.137,59.126h4.498v6.995h5.576V46.556h-5.576v6.994h-4.498V16.328h-5.574v57.667h-15.411v14.824h-7.63v-14.58h-13.044v14.58h-8.295v-14.58H82.138v14.58h-6.573v-14.58H59.072v14.58h-6.573v-14.58H39.458v36.338h13.041V94.391h6.573v16.186h16.493V94.391h6.573v16.186h13.044V94.391h8.295v16.186h13.044V94.391h7.63v40.457l17.634,17.637h13.185v31.182h5.577V73.996H145.14v-14.87H145.137z M154.97,146.907h-10.871l-14.376-14.376V79.57h25.247V146.907z'/>
      <rect fill='#999999' x='147.703' y='16.328' width='5.572' height='7.345'/>
      <rect fill='#999999' x='131.295' y='16.328' width='5.577' height='7.345'/>
    </g>;
  }
}

/**
 * Upload - From inbox
 */
export class Upload extends SvgIcon {
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <path d='M14 18h4v-8h6l-8-8-8 8h6zM20 13.5v3.085l9.158 3.415-13.158 4.907-13.158-4.907 9.158-3.415v-3.085l-12 4.5v8l16 6 16-6v-8z'/>;
  }
}

/**
 * Elite Dangerous Loader / Spinner
 */
export class Loader extends SvgIcon {
  /**
   * Overriden view box
   * @return {String} view box
   */
  viewBox() { return '0 0 40 40'; }
  /**
   * Generate the SVG
   * @return {React.Component} SVG Contents
   */
  svg() {
    return <g className={'loader'}>
      <path d='m5,8l5,8l5,-8z' className={'l1 d1'} />
      <path d='m5,8l5,-8l5,8z' className={'l1 d2'} />
      <path d='m10,0l5,8l5,-8z' className={'l1 d3'} />
      <path d='m15,8l5,-8l5,8z' className={'l1 d4'} />
      <path d='m20,0l5,8l5,-8z' className={'l1 d5'} />
      <path d='m25,8l5,-8l5,8z' className={'l1 d6'} />
      <path d='m25,8l5,8l5,-8z' className={'l1 d7'} />
      <path d='m30,16l5,-8l5,8z' className={'l1 d8'} />
      <path d='m30,16l5,8l5,-8z' className={'l1 d9'} />
      <path d='m25,24l5,-8l5,8z' className={'l1 d10'} />
      <path d='m25,24l5,8l5,-8z' className={'l1 d11'} />
      <path d='m20,32l5,-8l5,8z' className={'l1 d13'} />
      <path d='m15,24l5,8l5,-8z' className={'l1 d14'} />
      <path d='m10,32l5,-8l5,8z' className={'l1 d15'} />
      <path d='m5,24l5,8l5,-8z' className={'l1 d16'} />
      <path d='m5,24l5,-8l5,8z' className={'l1 d17'} />
      <path d='m0,16l5,8l5,-8z' className={'l1 d18'} />
      <path d='m0,16l5,-8l5,8z' className={'l1 d20'} />
      <path d='m10,16l5,-8l5,8z' className={'l2 d0'} />
      <path d='m15,8l5,8l5,-8z' className={'l2 d3'} />
      <path d='m20,16l5,-8l5,8z' className={'l2 d6'} />
      <path d='m20,16l5,8l5,-8z' className={'l2 d9'} />
      <path d='m15,24l5,-8l5,8z' className={'l2 d12'} />
      <path d='m10,16l5,8l5,-8z' className={'l2 d15'} />
    </g>;
  }
}
