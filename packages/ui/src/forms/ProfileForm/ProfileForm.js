import React, { useState } from 'react'
import { DEFAULT_PRONOUNS, profileSchema } from '@local/shared';
import { useMutation, useQuery } from '@apollo/client';
import { updateCustomerMutation } from 'graphql/mutation';
import { profileQuery } from 'graphql/query';
import { useFormik } from 'formik';
import { Autocomplete } from '@material-ui/lab';
import { PUBS, PubSub } from 'utils';
import { Button, Container, FormHelperText, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles } from '@material-ui/styles';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'react-phone-input-2/lib/material.css';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    buttons: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    phoneInput: {
        width: 'inherit',
    }
}));

function ProfileForm() {
    const classes = useStyles()
    const [editing, setEditing] = useState(false);
    const { data: profile } = useQuery(profileQuery);
    const [updateCustomer, { loading }] = useMutation(updateCustomerMutation);

    console.log('PROFILE DATA ISSS', profile)

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: profile?.profile?.firstName ?? '',
            lastName: profile?.profile?.lastName ?? '',
            business: profile?.profile?.business?.name ?? '',
            pronouns: profile?.profile?.pronouns ?? '',
            email: profile?.profile?.emails?.length > 0 ? profile.profile.emails[0].emailAddress : '',
            phone: profile?.profile?.phones?.length > 0 ? profile.profile.phones[0].number : '1',
            theme: profile?.profile?.theme,
            accountApproved: profile?.profile?.accountApproved || false,
            marketingEmails: profile?.profile?.emails?.length > 0 ? profile.profile.emails[0].receivesDeliveryUpdates : false,
            currentPassword: '',
            newPassword: '',
            newPasswordConfirmation: ''
        },
        validationSchema: profileSchema,
        onSubmit: (values) => {
            PubSub.publish(PUBS.Loading, true);
            let input = ({
                id: profile.profile.id,
                firstName: values.firstName,
                lastName: values.lastName,
                business: {
                    id: profile.profile.business.id,
                    name: values.business
                },
                pronouns: values.pronouns,
                emails: [
                    {
                        emailAddress: values.email,
                        receivesDeliveryUpdates: values.marketingEmails
                    }
                ],
                phones: [
                    {
                        number: values.phone
                    }
                ],
                theme: values.theme,
                accountApproved: values.accountApproved
            });
            // Only add email and phone ids if they previously existed
            if (profile?.profile?.emails?.length > 0) input.emails[0].id = profile.profile.emails[0].id;
            if (profile?.profile?.phones?.length > 0) input.phones[0].id = profile.profile.phones[0].id;
            console.log('UPDATING CUSTOMER WITH THE FOLLOWING INPUT', input);
            updateCustomer({
                variables: {
                    input: input,
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword
                }
            }).then((response) => {
                PubSub.publish(PUBS.Loading, false);
                if (response.ok) {
                    PubSub.publish(PUBS.Snack, { message: 'Profile updated.' })
                } else PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
            }).catch((response) => {
                PubSub.publish(PUBS.Loading, false);
                PubSub.publish(PUBS.Snack, { message: response.message, severity: 'error' });
            })
        },
    });

    const toggleEdit = (event) => {
        event.preventDefault();
        setEditing(edit => !edit);
    }

    return (
        <form className={classes.form} onSubmit={formik.handleSubmit} disabled={!editing}>
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            autoFocus
                            id="firstName"
                            name="firstName"
                            autoComplete="fname"
                            label="First Name"
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                            helperText={formik.touched.firstName && formik.errors.firstName}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            id="lastName"
                            name="lastName"
                            autoComplete="lname"
                            label="Last Name"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                            helperText={formik.touched.lastName && formik.errors.lastName}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            freeSolo
                            id="pronouns"
                            name="pronouns"
                            options={DEFAULT_PRONOUNS}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pronouns"
                                    value={formik.values.pronouns}
                                    onChange={formik.handleChange}
                                    error={formik.touched.pronouns && Boolean(formik.errors.pronouns)}
                                    helperText={formik.touched.pronouns && formik.errors.pronouns}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="business"
                            name="business"
                            autoComplete="business"
                            label="Business"
                            value={formik.values.business}
                            onChange={formik.handleChange}
                            error={formik.touched.business && Boolean(formik.errors.business)}
                            helperText={formik.touched.business && formik.errors.business}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            autoComplete="email"
                            label="Email Address"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <PhoneInput
                            inputProps={{ id: "phone", helperText: 'fdafdafdsa' }}
                            inputClass={classes.phoneInput}
                            enableSearch={true}
                            country={'us'}
                            id="phone"
                            name="phone"
                            autoComplete="tel"
                            value={formik.values.phone}
                            onChange={(number, country, e) => formik.handleChange(e)}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                        />
                        {formik.errors.phone}
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <RadioGroup
                                id="theme"
                                name="theme"
                                aria-label="theme-check"
                                value={formik.values.theme}
                                onChange={(e) => formik.handleChange(e) && PubSub.publish(PUBS.Theme, e.target.value)}
                            >
                                <FormControlLabel value="light" control={<Radio />} label="Light ☀️" />
                                <FormControlLabel value="dark" control={<Radio />} label="Dark 🌙" />
                            </RadioGroup>
                            <FormHelperText>{formik.touched.theme && formik.errors.theme}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <RadioGroup
                                id="accountApproved"
                                name="accountApproved"
                                aria-label="existing-customer-check"
                                value={formik.values.accountApproved}
                                onChange={formik.handleChange}
                            >
                                <FormControlLabel value={true} control={<Radio />} label="I have ordered from New Life Nursery before" />
                                <FormControlLabel value={false} control={<Radio />} label="I have never ordered from New Life Nursery" />
                            </RadioGroup>
                            <FormHelperText>{formik.touched.accountApproved && formik.errors.accountApproved}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id="marketingEmails"
                                    name="marketingEmails"
                                    value="marketingEmails"
                                    color="primary"
                                    checked={formik.values.marketingEmails}
                                    onChange={formik.handleChange}
                                />
                            }
                            label="I want to receive marketing promotions and updates via email."
                        />
                    </Grid>
                </Grid>
            </Container>
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            autoComplete="password"
                            label="Current Password"
                            value={formik.values.currentPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                            helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            label="New Password"
                            value={formik.values.newPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                            helperText={formik.touched.newPassword && formik.errors.newPassword}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="newPasswordConfirmation"
                            name="newPasswordConfirmation"
                            type="password"
                            autoComplete="new-password"
                            label="Confirm New Password"
                            value={formik.values.newPasswordConfirmation}
                            onChange={formik.handleChange}
                            error={formik.touched.newPasswordConfirmation && Boolean(formik.errors.newPasswordConfirmation)}
                            helperText={formik.touched.newPasswordConfirmation && formik.errors.newPasswordConfirmation}
                        />
                    </Grid>
                </Grid>
            </Container>
            <Grid className={classes.buttons} container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Button fullWidth onClick={toggleEdit}>
                        {editing ? "Cancel" : "Edit"}
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button
                        fullWidth
                        disabled={loading}
                        type="submit"
                        color="secondary"
                        className={classes.submit}
                    >
                        Save Changes
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
}

ProfileForm.propTypes = {

}

export { ProfileForm };