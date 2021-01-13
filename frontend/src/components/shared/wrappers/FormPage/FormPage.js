import React from 'react';
import PropTypes from 'prop-types';
import { StyledFormPage } from './FormPage.styled';

function FormPage(props) {
    return (
        <StyledFormPage>
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
}

export default FormPage;