import React, { PropTypes, Component } from 'react';
import {
  View,
  PanResponder
} from 'react-native';

import isValidSwipe from '../utils/isValidSwipe';

const directions = {
  SWIPE_UP: 'SWIPE_UP',
  SWIPE_DOWN: 'SWIPE_DOWN',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT'
};

const propTypes = {
  onSwipeBegin: PropTypes.func,
  onSwipe: PropTypes.func,
  onSwipeEnd: PropTypes.func,
  swipeDecoratorStyle: PropTypes.object,
};

class GestureRecognizer extends Component {
  constructor(props) {
    super(props);

    this.checkHorizontal = props.horizontal;
    this.checkVertical = props.vertical;

    // Used to determine if multiple taps are double taps
    this.lastTapTime = null;
    this.multiTapTimer = null;

    // Used for swipes
    this.swipeDetected = false;

    this.state = {
      swipe: {
        direction: null,
        fingers: 0,
        distance: 0,
        velocity: 0
      },
      tap: {
        numTaps: 0,
        fingers: 0
      }
    };
  }

  _validSwipe(gestureState) {
    var checkHorizontal = this.checkHorizontal;
    var checkVertical = this.checkVertical;

    var {verticalThreshold,
      horizontalThreshold,
   initialVelocityThreshold} = this.props;

    const {dx, dy, vx, vy} = gestureState;

    var validHorizontal = checkHorizontal && isValidSwipe(
            vx, dy, initialVelocityThreshold, verticalThreshold);
    var validVertical = checkVertical && isValidSwipe(
            vy, dx, initialVelocityThreshold, horizontalThreshold);

    return {
      validHorizontal: validHorizontal,
      validVertical: validVertical};
  }

  _handleSwipeEnd() {
    if (this.swipeDetected) {
      const { onSwipeEnd } = this.props;
      onSwipeEnd && onSwipeEnd({ direction: this.swipeDirection });
    }

    this.swipeDetected = false;
    this.velocityProp = null;
    this.distanceProp = null;
    this.swipeDirection = null;
  }

  componentWillMount() {
    // Reference some parameters for easy access
    var checkHorizontal = this.checkHorizontal;
    var checkVertical = this.checkVertical;
    var {
      initialVelocityThreshold,
      verticalThreshold,
      horizontalThreshold } = this.props;

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        var { validHorizontal, validVertical } = this._validSwipe(gestureState);
        return (validHorizontal || validVertical);
      },

      onPanResponderMove: (evt, gestureState) => {
        const {dx, dy, vx, vy} = gestureState;
        const { onSwipeBegin, onSwipe } = this.props;

        var { validHorizontal, validVertical } = this._validSwipe(gestureState);

        // Initial detection if it is not recorded yet
        let initialDetection = !this.swipeDetected;

        if (initialDetection) {
          var direction = null;
          if (validHorizontal) {
            this.velocityProp = 'vx';
            this.distanceProp = 'dx';
             if (dx < 0) {
               this.swipeDirection = directions.SWIPE_LEFT;
             } else {
               this.swipeDirection = directions.SWIPE_RIGHT;
             }
          }else if (validVertical) {
            this.velocityProp = 'vy';
            this.distanceProp = 'dy';
            if (dy < 0) {
              this.swipeDirection = directions.SWIPE_UP;
            }else {
              this.swipeDirection = directions.SWIPE_DOWN;
            }
          }

          if (this.swipeDirection) {
            this.swipeDetected = true;
          }
        }

        // Call the handler if the swipe is valid
        if (this.swipeDetected) {
          const distance = gestureState[this.distanceProp];
          const velocity = gestureState[this.velocityProp];

          const swipeState = {
            direction: this.swipeDirection,
            fingers: gestureState.numberActiveTouches,
            distance,
            velocity
          };

          if (initialDetection) {
            onSwipeBegin && onSwipeBegin(swipeState);
          } else {
            onSwipe && onSwipe(swipeState);
          }
        }
      },

      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: this._handleSwipeEnd.bind(this),
      onPanResponderRelease: this._handleSwipeEnd.bind(this)
    });
  }


  render() {
    const {
      onSwipeBegin,
      onSwipe,
      onSwipeEnd,
      swipeDecoratorStyle,
      wrapperStyles,
      style,
      ...props
    } = this.props;

    return (
      <View {...this.panResponder.panHandlers} style={style}>{this.props.children}</View>
    );
  }
}
GestureRecognizer.defaultProps = {
  horizontal: false,
  vertical: false,
  initialVelocityThreshold: 0.7,
  verticalThreshold: 10,
  horizontalThreshold: 10,
  wrapperStyles: {}
};
module.exports = GestureRecognizer;
