import React from 'react';
import { render } from 'react-dom';
import '../less/app.less';
import Coriolis from './Coriolis';
// import TapEventPlugin from 'react/lib/TapEventPlugin';
// import EventPluginHub from 'react/lib/EventPluginHub';

// onTouchTap not ready for primetime yet, too many issues with preventing default
// EventPluginHub.injection.injectEventPluginsByName({ TapEventPlugin });

render(<Coriolis />, document.getElementById('coriolis'));
