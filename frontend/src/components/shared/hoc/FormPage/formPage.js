import React from 'react';
import { StyledFormPage } from './formPage.styled';

export function formPage(Form, formProps) {
    class FormPage extends React.Component {
        render() {
            return (
                <StyledFormPage>
                    <Form {...formProps} />
                </StyledFormPage>
            );
        }
    }

    return FormPage;
}