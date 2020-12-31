import React from 'react';
import PropTypes from 'prop-types';

export class ClickOutside extends React.Component {
  constructor(props) {
    super(props);

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidUpdate(prevProps) {
    let was_active = prevProps.active !== null ? prevProps.active : true;
    let is_active = this.props.active !== null ? this.props.active : true;
    if (was_active && !is_active) {
      document.removeEventListener('mousedown', this.handleClickOutside);
    } else if (!was_active && is_active) {
      document.addEventListener('mousedown', this.handleClickOutside);
    }
  }

  componentDidMount() {
    let active = this.props.active !== undefined ? this.props.active : true;
    if (active) {
      document.addEventListener('mousedown', this.handleClickOutside);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.on_click_outside();
    }
  }

  render() {
    return (
      <div ref={this.setWrapperRef}
           className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}

ClickOutside.propTypes = {
  children: PropTypes.any.isRequired,
  on_click_outside: PropTypes.func.isRequired,
  active: PropTypes.bool,
};

export default ClickOutside;