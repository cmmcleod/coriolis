import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';

export default class DeleteAllModal extends TranslatedComponent {

  static propTypes = {
    title: React.propTypes.string,
    promise: : React.propTypes.func,
    data: React.propTypes.oneOfType[React.propTypes.string, React.propTypes.object]
  };

  constructor(props) {
    super(props);
    let exportJson;

    if (props.promise) {
      exportJson = 'Generating...';
    } else if(typeof props.data == 'string') {
      exportJson = props.data;
    } else {
      exportJson = JSON.stringify(this.props.data);
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
        <textarea className='cb json' onFocus={ (e) => e.target.select() }>{this.state.exportJson}</textarea>
      </div>
      <button className={'r dismiss cap'} onClick={InterfaceEvents.hideModal}>{translate('close')}</button>
    </div>;
  }
}
