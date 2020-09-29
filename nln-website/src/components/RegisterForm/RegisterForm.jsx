import React from 'react';
import './RegisterForm.css';
import PropTypes from 'prop-types';
import PubSub from '../../utils/pubsub';
import * as actionCreators from '../../actions/auth'
import TextField from '@material-ui/core/TextField';
import { Redirect } from "react-router-dom";

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.setSignUp = this.setSignUp.bind(this);
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      isSignUp: this.props.isSignUp,
      submitting: false,
      redirect: null,
    }
  }

  setSignUp(isSign) {
    this.setState({ isSignUp: isSign });
  }

  setSubmit(isSubmitting) {
    this.setState({ submitting: isSubmitting })
    PubSub.publish('Loading', isSubmitting)
  }

  register(formData) {
    this.setSubmit(true);
    actionCreators.registerUser(formData.name, formData.email, formData.password).then(response => {
      console.log('woohoo registered!!!');
      console.log(response);
      this.setSubmit(false);
      this.setState({ redirect: '/profile' });
    }).catch(error => {
      console.log('received error here hereh here')
      console.error(error);
      this.setSubmit(false);
    })
  }

  login(formData) {
    console.log('bloop')
    this.setSubmit(true);
    actionCreators.loginUser(formData.email, formData.password).then(response => {
      this.setSubmit(false);
      this.setState({ redirect: '/profile' });
    }).catch(error => {
      console.error(error);
      this.setSubmit(false);
    })
  }

  render() {
    let fields;
    if (this.state.isSignUp) {
      fields = <SignUpFields onSubmit={this.register} submitting={this.state.submitting} />
    } else {
      fields = <LoginFields onSubmit={this.login} submitting={this.state.submitting} />
    }
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="form-switch">
          <ToggleForm text='Sign Up' active={this.state.isSignUp} onClick={() => this.setSignUp(true)} />
          <ToggleForm text='Log In' active={!this.state.isSignUp} onClick={() => this.setSignUp(false)} />
        </div>
        {fields}
      </form>
    );
  }
}

RegisterForm.propTypes = {
  isSignUp: PropTypes.bool.isRequired,
}

function ToggleForm(props) {
  return (
    <u className={props.active ? 'toggle-active' : 'toggle-inactive'} onClick={props.onClick}>{props.text}</u>
  );
}

class SignUpFields extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = {
      name: "",
      nameError: "",
      email: "",
      emailError: "",
      password: "",
      passwordError: "",
      confirmPassword: "",
    }
  }
  submit(event) {
    event.preventDefault();
    if (this.validate()) {
      this.props.onSubmit(this.state);
    }
  }
  change = e => {
    this.setState({ [e.target.name]: e.target.value });
  }
  validate() {
    let isError = false;
    const errors = {
      nameError: "",
      emailError: "",
      passwordError: ""
    }

    if (this.state.name === "") {
      isError = true;
      errors.nameError = "Name cannot be blank";
    }

    if (this.state.email.indexOf("@") === -1) {
      isError = true;
      errors.emailError = "Requires valid email"
    }

    if (this.state.password !== this.state.confirmPassword) {
      isError = true;
      errors.passwordError = "Passwords do not match"
    }

    if (this.state.password.length < 8) {
      isError = true;
      errors.passwordError = "Password must be at least 8 characters long"
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return !isError
  }
  render() {
    return (
      <React.Fragment>
        <TextField
          name="name"
          className="form-input"
          variant="outlined"
          label="Name"
          value={this.state.name}
          onChange={e => this.change(e)}
          error={this.state.nameError.length > 0}
          helperText={this.state.nameError}
          required
        />
        <TextField
          name="email"
          className="form-input"
          type="email"
          variant="outlined"
          label="Email"
          value={this.state.email}
          onChange={e => this.change(e)}
          error={this.state.emailError.length > 0}
          helperText={this.state.emailError}
          required
        />
        <TextField
          name="password"
          className="form-input"
          type="password"
          variant="outlined"
          label="Password"
          value={this.state.password}
          onChange={e => this.change(e)}
          error={this.state.passwordError.length > 0}
          helperText={this.state.passwordError}
          required
        />
        <TextField
          name="confirmPassword"
          className="form-input"
          type="password"
          variant="outlined"
          label="Confirm Password"
          value={this.state.confirmPassword}
          onChange={e => this.change(e)}
          required
        />
        <div className="form-group">
          <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
            Submit
     </button>
        </div>
      </React.Fragment>
    );
  }
}

class LoginFields extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = {
      email: "",
      emailError: "",
      password: "",
      passwordError: "",
    }
  }
  submit(event) {
    event.preventDefault();
    if (this.validate()) {
      this.props.onSubmit(this.state);
    }
  }
  change = e => {
    this.setState({ [e.target.name]: e.target.value });
  }
  validate() {
    let isError = false;
    const errors = {
      emailError: "",
      passwordError: ""
    }

    if (this.state.email.length === 0) {
      isError = true;
      errors.emailError = "Must enter email"
    }

    if (this.state.password.length === 0) {
      isError = true;
      errors.passwordError = "Must enter password"
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return !isError
  }
  render() {
    return (
      <React.Fragment>
        <TextField
          name="email"
          className="form-input"
          type="email"
          variant="outlined"
          label="Email"
          value={this.state.email}
          onChange={e => this.change(e)}
          error={this.state.emailError.length > 0}
          helperText={this.state.emailError}
          required
        />
        <TextField
          name="password"
          className="form-input"
          type="password"
          variant="outlined"
          label="Password"
          value={this.state.password}
          onChange={e => this.change(e)}
          error={this.state.passwordError.length > 0}
          helperText={this.state.passwordError}
          required
        />
        <div className="form-group">
          <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
            Submit
     </button>
        </div>
      </React.Fragment>
    );
  }
}

export default RegisterForm