import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import '../less/app.less';
import Coriolis from './Coriolis';
import TapEventPlugin from 'react/lib/TapEventPlugin';
import EventPluginHub from 'react/lib/EventPluginHub';

EventPluginHub.injection.injectEventPluginsByName({ TapEventPlugin });

render(<Coriolis />, document.getElementById('coriolis'));
