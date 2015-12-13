import React from 'react';
import TranslatedComponent from './TranslatedComponent';

const RENDER_POINTS = 20;   // Only render 20 points on the graph

export default class LineChart extends TranslatedComponent {

  static defaultProps = {
    xMin: 0,
    yMin: 0,
    colors: ['#ff8c0d']
  }

  static PropTypes = {
    xMax: React.PropTypes.number.isRequired,
    yMax: React.PropTypes.number.isRequired,
    func: React.PropTypes.func.isRequired,
    series: React.PropTypes.array,
    colors: React.PropTypes.array,
    xMin: React.PropTypes.number,
    yMin: React.PropTypes.number,
    xUnit: React.PropTypes.string,
    yUnit: React.PropTypes.string,
    xLabel: React.PropTypes.string,
    xLabel: React.PropTypes.string,
  };

  constructor(props) {
    super(props);

    // init

  }

  componentWillMount(){
    // Listen to window resize
  }

  componentWillUnmount(){
    // remove window listener
    // remove mouse move listener / touch listner?
  }

  componentWillReceiveProps(nextProps, nextContext) {
    // on language change update formatting
  }

  render() {
    return <div></div>;
  }
}
