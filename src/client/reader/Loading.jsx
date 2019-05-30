import React from 'react';
import Events, { SET_READY_TO_READ } from './Events';

export default class Loading extends React.Component {
  state = {
    isLoading: false,
  };

  constructor(props) {
    super(props);
    this.onReadyToReadSet = this.onReadyToReadSet.bind(this);
  }

  componentDidMount() {
    Events.on(SET_READY_TO_READ, this.onReadyToReadSet);
  }

  onReadyToReadSet(readyToRead) {
    this.setState({ isLoading: !readyToRead });
  }

  render() {
    if (!this.state.isLoading) return null;
    return (<div style={{ width: '100%', height: '100%', background: '#fff', opacity: '0.5', position: 'fixed', top: '50px' }}>Loading...</div>);
  }
}
