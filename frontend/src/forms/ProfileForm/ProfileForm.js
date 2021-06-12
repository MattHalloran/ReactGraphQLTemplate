import { useEffect, useState } from 'react'
import { DEFAULT_PRONOUNS, profileSchema } from '@local/shared';
import { useMutation, useQuery } from '@apollo/client';
import { editProfileMutation } from 'graphql/mutation';
import { profileQuery } from 'graphql/query';
import { useFormik } from 'formik';
import { Autocomplete } from '@material-ui/lab';
import { lightTheme, PUBS, PubSub } from 'utils';
import { Button, Container, FormHelperText, Grid, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
    form: {
        width: '100%',
        // marginTop: theme.spacing(3),
        marginTop: lightTheme.spacing(3),
    },
    buttons: {
        // paddingTop: theme.spacing(2),
        paddingTop: lightTheme.spacing(2),
        // paddingBottom: theme.spacing(2),
        paddingBottom: lightTheme.spacing(2),
    },
}));

function ProfileForm() {
    const classes = useStyles()
    const [editing, setEditing] = useState(false);
    const { data: profile } = useQuery(profileQuery);
    const [editProfile, { loading }] = useMutation(editProfileMutation);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: profile?.profile?.firstName,
            lastName: profile?.profile?.lastName,
            businessName: profile?.profile?.business?.name ?? '',
            pronouns: profile?.profile?.pronouns,
            email: profile?.profile?.emails?.length > 0 ? profile.profile.emails[0].emailAddress : '',
            phone: profile?.profile?.phones?.length > 0 ? profile.profile.phones[0].number : '',
            theme: profile?.profile?.theme,
        },
        validationSchema: profileSchema,
        onSubmit: (values) => {
            PubSub.publish(PUBS.Loading, true);
            editProfile({
                variables: values
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
                        <TextField
                            fullWidth
                            id="phone"
                            name="phone"
                            autoComplete="tel"
                            label="Phone Number"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                        />
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
                                <FormControlLabel value="true" control={<Radio />} label="Light ☀️" />
                                <FormControlLabel value="false" control={<Radio />} label="Dark 🌙" />
                            </RadioGroup>
                            <FormHelperText>{formik.touched.theme && formik.errors.theme}</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <RadioGroup
                                id="existingCustomer"
                                name="existingCustomer"
                                aria-label="existing-customer-check"
                                value={formik.values.existingCustomer}
                                onChange={formik.handleChange}
                            >
                                <FormControlLabel value="true" control={<Radio />} label="I have ordered from New Life Nursery before" />
                                <FormControlLabel value="false" control={<Radio />} label="I have never ordered from New Life Nursery" />
                            </RadioGroup>
                            <FormHelperText>{formik.touched.existingCustomer && formik.errors.existingCustomer}</FormHelperText>
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
                            name="newPassword"
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