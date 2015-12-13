import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';

export default class AvailableModulesMenu extends TranslatedComponent {

  static propTypes = {
    modules: React.PropTypes.oneOfType([ React.PropTypes.object, React.PropTypes.array ]).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    m: React.PropTypes.object,
    shipMass: React.PropTypes.number,
    warning: React.PropTypes.func
  };

  static defaultProps = {
    shipMass: 0
  };

  buildGroup(translate, mountedModule, warningFunc, mass, onSelect, grp, modules) {
    let prevClass = null, prevRating = null;
    let elems = [];

    for (let i = 0; i < modules.length; i++) {
      let m = modules[i];
      let mount = null;
      let classes = cn(m.name ? 'lc' : 'c', {
        active: mountedModule && mountedModule.id === m.id,
        warning: warningFunc && warningFunc(m),
        disabled: m.maxmass && (mass + (m.mass ? m.mass : 0)) > m.maxmass
      });

      switch(m.mount) {
         case 'F': mount = <MountFixed className={'lg'} />; break;
         case 'G': mount = <MountGimballed className={'lg'}/>; break;
         case 'T': mount = <MountTurret className={'lg'}/>; break;
      }

      if (i > 0 && modules.length > 3 && m.class != prevClass && (m.rating != prevRating || m.mount) && m.grp != 'pa') {
        elems.push(<br key={m.grp + i} />);
      }

      elems.push(
        <li key={m.id} className={classes} onClick={onSelect.bind(null, m)}>
          {mount}
          <span>{(mount ? ' ' : '') + m.class + m.rating + (m.missile ? '/' + m.missile : '') + (m.name ? ' ' + translate(m.name) : '')}</span>
        </li>
      );
      prevClass = m.class;
      prevRating = m.rating;
    }

    return <ul key={'modules' + grp} >{elems}</ul>;
  }

  componentDidMount() {
    let m = this.props.m

    if (!(this.props.modules instanceof Array) && m && m.grp) {
      findDOMNode(this).scrollTop = this.refs[m.grp].offsetTop; // Scroll to currently selected group
    }
  }

  render() {
    let translate = this.context.language.translate;
    let m = this.props.m;
    let modules = this.props.modules;
    let list;
    let buildGroup = this.buildGroup.bind(
      null,
      translate,
      m,
      this.props.warning,
      this.props.shipMass - (m && m.mass ? m.mass : 0),
      this.props.onSelect
    );

    if (modules instanceof Array) {
      list = buildGroup(modules[0].grp, modules);
    } else {
      list = [];
      // At present time slots with grouped options (Hardpoints and Internal) can be empty
      list.push(<div className={'empty-c upp'} key={'empty'} onClick={this.props.onSelect.bind(null, null)} >{translate('empty')}</div>);
      for (let g in modules) {
        list.push(<div ref={g} key={g} className={'select-group cap'}>{translate(g)}</div>);
        list.push(buildGroup(g, modules[g]));
      }
    }

    return (
      <div className={cn('select', this.props.className)} onClick={(e) => e.stopPropagation() }>
        {list}
      </div>
    );
  }

}
