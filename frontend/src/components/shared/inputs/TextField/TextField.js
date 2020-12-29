import React from "react";
import PropTypes from 'prop-types';
import { StyledTextField } from "./TextField.styled";

class TextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: this.props.locked ?? false,
        }
    }

    render() {
        return (
            <StyledTextField large_placeholder={this.props.value.length === 0 && !this.state.active} has_error={this.props.error.length > 0}>
                <input
                    name={this.props.name}
                    type={this.props.type}
                    value={this.props.value}
                    autocomplete={this.props.autocomplete ?? 'auto'}
                    onChange={this.props.onChange}
                    onFocus={() => !this.props.locked && this.setState({ active: true })}
                    onBlur={() => !this.props.locked && this.setState({ active: false })}
                />
                <label className="text-label">{this.props.label ?? "Label"}</label>
                <label className="error-label">{this.props.error}</label>
            </StyledTextField>
        );
    }
}

TextField.propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    locked: PropTypes.bool,
    error: PropTypes.string,
    onChange: PropTypes.func.isRequired,
}

export default TextField;