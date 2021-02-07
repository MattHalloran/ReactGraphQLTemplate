import PropTypes from 'prop-types';
import { getTheme } from 'storage';
import { StyledFormPage } from './FormPage.styled';

function FormPage({
    header,
    children,
    theme = getTheme(),
}) {
    return (
        <StyledFormPage theme={theme}>
            <form className="form">
                <div className="form-header">
                    <h1>{header}</h1>
                </div>
                <div className="form-body">
                    {children}
                </div>
            </form>
        </StyledFormPage>
    );
}

FormPage.propTypes = {
    header: PropTypes.string.isRequired,
    theme: PropTypes.object,
    children: PropTypes.any,
}

export default FormPage;