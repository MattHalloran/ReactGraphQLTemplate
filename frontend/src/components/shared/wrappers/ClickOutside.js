import React from 'react';
import PropTypes from 'prop-types';

export class ClickOutside extends React.Component {
  constructor(props) {
    super(props);

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
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
};

export default ClickOutside;