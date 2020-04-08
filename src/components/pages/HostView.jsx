import React, { Component } from "react";
import { useParams, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

export default class HostView extends Component {
  render() {
    return <div>Room Code: {this.props.match.params.code}</div>;
  }
}
