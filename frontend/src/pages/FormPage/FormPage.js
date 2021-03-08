import PropTypes from 'prop-types';
import { getTheme } from 'utils/storage';
import { StyledFormPage } from './FormPage.styled';

function FormPage({
    header,
    autocomplete = 'on',
    children,
    maxWidth = '90%',
    theme = getTheme(),
}) {
    return (
        <StyledFormPage theme={theme} maxWidth={maxWidth}>
            <form className="form" autocomplete={autocomplete}>
                <div className="header">
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
    autocomplete: PropTypes.string,
    children: PropTypes.any,
    maxWidth: PropTypes.string,
    theme: PropTypes.object,
}

export default FormPage;