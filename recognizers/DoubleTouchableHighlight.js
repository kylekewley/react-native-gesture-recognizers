import React, {Component} from 'react';
import {
  TouchableHighlight,
} from 'react-native';

var reactMixin = require('react-mixin');
var TimerMixin = require('react-timer-mixin');


class DoubleTouchableHighlight extends Component {

  constructor(props) {
    super(props);

    this.timer = null;
    this.lastPress = 0;
  }


  _innerPress(doubleTapTime, onPress, onDoublePress, e) {
    var currentTime = new Date().getTime();
    var delta = currentTime - this.lastPress;

    // Check if in the last doubleTapTime ms
    if (delta < doubleTapTime) {
      // For sure a double press
      this._confirmedDoublePress(onDoublePress, e);
    }else {
      // Only a single press or the start of a double press so we need
      // to set the lastPress to the current time for the next function call.
      this.lastPress = currentTime;

      // Add a timer to trigger a single press if the double press isn't detected in doubleTapTime
      this.timer = this.setTimeout(() => this._confirmedSinglePress(onPress, doubleTapTime, e), doubleTapTime);
    }
  }

  _confirmedDoublePress(onDoublePress, e) {
      // Execute the doublePress and reset the timer
      if (typeof onDoublePress === 'function') onDoublePress(e);
      this.lastPress = 0;

      // Clear the single press timer
      if (this.timer) {
        this.clearTimeout(this.timer);
      }
  }

  _confirmedSinglePress(onPress, doubleTapTime, e) {
    var currentTime = new Date().getTime();
    var d = currentTime - this.lastPress;

    // Sometimes the setTimeout function is very inaccurate, so it is best to make sure
    // we are actually at our timeout before triggering a tap
    if (d < doubleTapTime) {
      this.timer = this.setTimeout(() => this._confirmedSinglePress(onPress, e), doubleTapTime - d);
    }else {
      this.timer = null;
      this.lastPress = 0;
      if (typeof onPress === 'function') onPress(e);
    }
  }

  render() {
    var { children, doubleTapTime, onPress, onDoublePress, ...other } = this.props;
    var pressFunction = this._innerPress.bind(this, doubleTapTime, onPress, onDoublePress);
    return (
      <TouchableHighlight {...other} onPress={pressFunction}>
        {children}
      </TouchableHighlight>
    );
  }
}
DoubleTouchableHighlight.defaultProps = {
  doubleTapTime: 200,
};
reactMixin(DoubleTouchableHighlight.prototype, TimerMixin);

module.exports = DoubleTouchableHighlight;


