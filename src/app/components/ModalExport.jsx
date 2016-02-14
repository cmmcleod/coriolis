import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';

/**
 * Export Modal
 */
export default class ModalExport extends TranslatedComponent {

  static propTypes = {
    title: React.PropTypes.string,
    generator: React.PropTypes.func,
    data: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object, React.PropTypes.array])
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    let exportJson;

    if (props.generator) {
      exportJson = 'Generating...';
    } else if(typeof props.data == 'string') {
      exportJson = props.data;
    } else {
      exportJson = JSON.stringify(this.props.data, null, 2);
    }

    this.state = { exportJson };
  }

  /**
   * If generator is provided, execute on mount
   */
  componentWillMount() {
    if (this.props.generator) {
      this.props.generator((str) => this.setState({ exportJson: str }));
    }
  }

  /**
   * Focus on textarea and select all
   */
  componentDidMount() {
    let e = findDOMNode(this.refs.exportField);
    if (e) {
      e.focus();
      e.select();
    }
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;
    let description;

    if (this.props.description) {
      description = <div>{translate(this.props.description)}</div>;
    }

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate(this.props.title || 'Export')}</h2>
      {description}
      <div>
        <textarea className='cb json' ref='exportField' readOnly value={this.state.exportJson} />
      </div>
      <button className='r dismiss cap' onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
