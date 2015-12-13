import React from 'react';
import { findDOMNode } from 'react-dom';
import d3 from 'd3';
import cn from 'classnames';
import Persist from '../stores/Persist';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';
import { wrapCtxMenu } from '../utils/InterfaceEvents';

/**
 * Round to avoid floating point precision errors
 * @param  {[type]} selected [description]
 * @param  {[type]} sum      [description]
 * @param  {[type]} avail    [description]
 * @return {[type]}          [description]
 */
function getClass(selected, sum, avail) {
  return selected ? 'secondary' : ((Math.round(sum * 100) / 100) >= avail) ? 'warning' : 'primary';
}

function bandText(val, index, wattScale) {
  return (val > 0 && wattScale(val) > 13) ? index + 1 : null;
}

export default class PowerBands extends TranslatedComponent {

  static propTypes = {
    bands: React.PropTypes.array.isRequired,
    available: React.PropTypes.number.isRequired,
    code: React.PropTypes.string
  };

  constructor(props, context) {
    super(props);
    this.wattScale = d3.scale.linear();
    this.pctScale = d3.scale.linear().domain([0, 1]);
    this.wattAxis = d3.svg.axis().scale(this.wattScale).outerTickSize(0).orient('top').tickFormat(context.language.formats.r2);
    this.pctAxis = d3.svg.axis().scale(this.pctScale).outerTickSize(0).orient('bottom').tickFormat(context.language.formats.rPct);

    this._updateWidth = this._updateWidth.bind(this);
    this._updateAxes = this._updateAxes.bind(this);
    this._selectNone = this._selectNone.bind(this);

    let maxBand = props.bands[props.bands.length - 1];

    this.state = {
      outerWidth: 0,
      innerWidth: 0,
      sizes: this._initSizes(Persist.getSizeRatio()),
      maxPwr: Math.max(props.available, maxBand.retractedSum, maxBand.deployedSum),
      ret: {},
      dep: {}
    };
  }

  _initSizes(size) {
    let barHeight = Math.round(20 * size);
    let innerHeight = (barHeight * 2) + 2;
    let mTop = Math.round(25 * size);
    let mBottom = Math.round(25 * size);

    return {
      barHeight,
      innerHeight,
      mTop,
      mBottom,
      mLeft: Math.round(45 * size),
      mRight: Math.round(130 * size),
      height: innerHeight + mTop + mBottom,
      retY: (barHeight / 2),
      depY: (barHeight * 1.5) - 1
    };
  }

  _selectNone() {
    this.setState({
      ret : {},
      dep: {}
    });
  }

  _selectRet(index) {
    let ret = this.state.ret;
    if(ret[index]) {
      delete ret[index];
    } else {
      ret[index] = 1;
    }

    this.setState({ ret: Object.assign({}, ret) });
  }

  _selectDep(index) {
    let dep = this.state.dep;

    if(dep[index]) {
      delete dep[index];
    } else {
      dep[index] = 1;
    }

    this.setState({ dep: Object.assign({}, dep) });
  }

  _updateAxes(innerWidth, maxPwr, available) {
    this.wattScale.range([0, innerWidth]).domain([0,maxPwr]).clamp(true);
    this.pctScale.range([0, innerWidth]).domain([0, maxPwr / available]).clamp(true);
  }

  _updateWidth() {
    let outerWidth = findDOMNode(this).offsetWidth;
    let innerWidth = outerWidth - this.state.sizes.mLeft - this.state.sizes.mRight;
    this._updateAxes(innerWidth, this.state.maxPwr, this.props.available);
    this.setState({ outerWidth, innerWidth });
  }

  componentWillMount(){
    this.resizeListener = InterfaceEvents.addListener('windowResized', this._updateWidth);
    this.sizeListener = Persist.addListener('sizeRatio', (sizeRatio) => this.setState({ sizes: this._initSizes(sizeRatio) }));
  }

  componentDidMount() {
    this._updateWidth();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let { innerWidth, maxPwr } = this.state;
    let maxBand = nextProps.bands[nextProps.bands.length - 1];
    let nextMaxPwr = Math.max(nextProps.available, maxBand.retractedSum, maxBand.deployedSum);

    if (maxPwr != nextMaxPwr) { // Update Axes if max power has changed
      this._updateAxes(innerWidth, nextMaxPwr, nextProps.available);
      this.setState({ maxPwr: nextMaxPwr });
    }

    if (this.context !== nextContext) {
      this.wattAxis.tickFormat(nextContext.language.formats.r2);
      this.pctAxis.tickFormat(nextContext.language.formats.rPct);
    }
  }

  componentWillUnmount(){
    this.resizeListener.remove();
    this.sizeListener.remove();
  }

  render() {
    let { wattScale, pctScale, context, props, state } = this;
    let { translate, formats } = context.language;
    let { f2, pct1, rPct, r2 } = formats; // wattFmt, pctFmt, pctAxis, wattAxis
    let { available, bands } = props;
    let { sizes, outerWidth, innerWidth, maxPwr, ret, dep } = state;
    let pwrWarningClass = cn('threshold', {exceeded: bands[0].retractedSum * 2 >= available });
    let deployed = [];
    let retracted = [];
    let retSelected = Object.keys(ret).length > 0;
    let depSelected = Object.keys(dep).length > 0;
    let retSum = 0;
    let depSum = 0;

    if (outerWidth > 0) {
      for (var i = 0; i < bands.length; i++) {
        let b = bands[i];
        retSum += (!retSelected || ret[i]) ? b.retracted : 0;
        depSum += (!depSelected || dep[i]) ? b.deployed + b.retracted : 0;

        if (outerWidth && b.retracted > 0) {
          let retLbl = bandText(b.retracted, i, wattScale);

          retracted.push(<rect
            key={'rB' + i}
            width={Math.ceil(Math.max(wattScale(b.retracted), 0))}
            height={sizes.barHeight}
            x={Math.floor(Math.max(wattScale(b.retractedSum) - wattScale(b.retracted), 0))}
            y={1}
            onClick={this._selectRet.bind(this, i)}
            className={getClass(ret[i], b.retractedSum, available)}
          />);

          if (retLbl) {
            retracted.push(<text
              key={'rT' + i}
              dy='0.5em'
              textAnchor='middle'
              height={sizes.barHeight}
              x={wattScale(b.retractedSum) - (wattScale(b.retracted) / 2)}
              y={sizes.retY}
              onClick={this._selectRet.bind(this, i)}
              className='primary-bg'>{retLbl}</text>
            );
          }
        }

        if (outerWidth && (b.retracted > 0 || b.deployed > 0)) {
          let depLbl = bandText(b.deployed + b.retracted, i, wattScale);

          deployed.push(<rect
            key={'dB' + i}
            width={Math.ceil(Math.max(wattScale(b.deployed + b.retracted), 0))}
            height={sizes.barHeight}
            x={Math.floor(Math.max(wattScale(b.deployedSum) - wattScale(b.retracted) - wattScale(b.deployed), 0))}
            y={sizes.barHeight + 1}
            onClick={this._selectDep.bind(this, i)}
            className={getClass(dep[i], b.deployedSum, available)}
          />);

          if (depLbl) {
            deployed.push(<text
              key={'dT' + i}
              dy='0.5em'
              textAnchor='middle'
              height={sizes.barHeight}
              x={wattScale(b.deployedSum) - ((wattScale(b.retracted) + wattScale(b.deployed)) / 2)}
              y={sizes.depY}
              onClick={this._selectDep.bind(this, i)}
              className='primary-bg'>{depLbl}</text>
            );
          }
        }
      }
    }

    return (
      <svg style={{ marginTop: '1em', width: '100%', height: sizes.height }} onContextMenu={wrapCtxMenu(this._selectNone)}>
        <g transform={`translate(${sizes.mLeft},${sizes.mTop})`}>
          <g className='power-band'>{retracted}</g>
          <g className='power-band'>{deployed}</g>
          <g ref={ (elem) => d3.select(elem).call(this.wattAxis) } className='watt axis'></g>
          <g ref={ (elem) => {
              let axis = d3.select(elem);
              axis.call(this.pctAxis);
              axis.select('g:nth-child(6)').selectAll('line, text').attr('class', pwrWarningClass);
            }}
            className='pct axis' transform={`translate(0,${sizes.innerHeight})`}></g>
          <line x1={pctScale(0.5)} x2={pctScale(0.5)} y1='0' y2={sizes.innerHeight} className={pwrWarningClass} />
          <text dy='0.5em' x='-3' y={sizes.retY} className='primary upp' textAnchor='end'>{translate('ret')}</text>
          <text dy='0.5em' x='-3' y={sizes.depY} className='primary upp' textAnchor='end'>{translate('dep')}</text>
          <text dy='0.5em' x={innerWidth + 5} y={sizes.retY} className={getClass(retSelected, retSum, available)}>{f2(Math.max(0, retSum)) + ' (' + pct1(Math.max(0, retSum / available)) + ')'}</text>
          <text dy='0.5em' x={innerWidth + 5} y={sizes.depY} className={getClass(depSelected, depSum, available)}>{f2(Math.max(0, depSum)) + ' (' + pct1(Math.max(0, depSum / available)) + ')'}</text>
        </g>
      </svg>
    );
  }
}
