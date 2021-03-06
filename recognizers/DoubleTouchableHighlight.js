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
    this.numFingers = 1;
  }


  _innerPress(doubleTapTime, onPress, onDoublePress, e) {
    var currentTime = new Date().getTime();
    var delta = currentTime - this.lastPress;

    // Check if in the last doubleTapTime ms
    if (delta < doubleTapTime) {
      this.numFingers = Math.min(this.numFingers, e.nativeEvent.changedTouches.length);
      // For sure a double press
      this._confirmedDoublePress(onDoublePress);
    }else {
      this.numFingers = e.nativeEvent.changedTouches.length;

      // Only a single press or the start of a double press so we need
      // to set the lastPress to the current time for the next function call.
      this.lastPress = currentTime;

      // Add a timer to trigger a single press if the double press isn't detected in doubleTapTime
      this.timer = this.setTimeout(() => this._confirmedSinglePress(onPress, doubleTapTime), doubleTapTime);
    }
  }

  _confirmedDoublePress(onDoublePress) {
      // Execute the doublePress and reset the timer
      if (typeof onDoublePress === 'function') onDoublePress(this.numFingers);
      this.lastPress = 0;
      this.numFingers = 1;

      // Clear the single press timer
      if (this.timer) {
        this.clearTimeout(this.timer);
      }
  }

  _confirmedSinglePress(onPress, doubleTapTime) {
    var currentTime = new Date().getTime();
    var d = currentTime - this.lastPress;

    // Sometimes the setTimeout function is very inaccurate, so it is best to make sure
    // we are actually at our timeout before triggering a tap
    if (d < doubleTapTime) {
      this.timer = this.setTimeout(() => this._confirmedSinglePress(onPress, doubleTapTime), doubleTapTime - d);
    }else {
      this.timer = null;
      this.lastPress = 0;
      if (typeof onPress === 'function') onPress(this.numFingers);
      this.numFingers = 1;
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


