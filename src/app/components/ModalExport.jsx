import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';

export default class ModalExport extends TranslatedComponent {

  static propTypes = {
    title: React.PropTypes.string,
    promise: React.PropTypes.func,
    data: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object])
  };

  constructor(props) {
    super(props);
    let exportJson;

    if (props.promise) {
      exportJson = 'Generating...';
    } else if(typeof props.data == 'string') {
      exportJson = props.data;
    } else {
      exportJson = JSON.stringify(this.props.data, null, 2);
    }

    this.state = { exportJson };
  }

  componentWillMount(){
    // When promise is done update exportJson accordingly
  }

  render() {
    let translate = this.context.language.translate;
    let description;

    if (this.props.description) {
      description = <div>{translate(this.props.description)}</div>
    }

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate(this.props.title || 'Export')}</h2>
      {description}
      <div>
        <textarea className='cb json' onFocus={ (e) => e.target.select() } readOnly value={this.state.exportJson} />
      </div>
      <button className={'r dismiss cap'} onClick={InterfaceEvents.hideModal}>{translate('close')}</button>
    </div>;
  }
}
