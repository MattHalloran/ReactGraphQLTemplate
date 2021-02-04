import React from 'react';
import PropTypes from 'prop-types';
import { getTheme } from 'storage';
import { StyledFormPage } from './FormPage.styled';

function FormPage(props) {
    const theme = props.theme ?? getTheme();
    return (
        <StyledFormPage theme={theme}>
            <form className="form">
                <div className="form-header">
                    <h1>{props.header}</h1>
                </div>
                <div className="form-body">
                    {props.children}
                </div>
            </form>
        </StyledFormPage>
    );
}

FormPage.propTypes = {
    header: PropTypes.string.isRequired,
    theme: PropTypes.object,
}

export default FormPage;