import React from 'react';
import './RegisterForm.css';
import PropTypes from 'prop-types';
import PubSub from '../../pubsub';
import TextField from '@material-ui/core/TextField';

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.toSignUp = this.toSignUp.bind(this);
    this.toLogIn = this.toLogIn.bind(this);
    this.submit = this.submit.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      isSignUp: this.props.isSignUp,
      submitting: false,
    }
  }

  toSignUp() {
    this.setState({ isSignUp: true });
  }

  toLogIn() {
    this.setState({ isSignUp: false });
  }

  submit(event) {
    event.preventDefault();
    this.setSubmit(true);
  }

  setSubmit(isSubmitting) {
    this.setState({ submitting: isSubmitting })
    // PubSub.publish('Loading', isSubmitting)
  }

  registerUser(formData) {
    console.log('register user');
    if (formData.password != formData.confirmPassword) {
      alert('Passwords do not match');
      console.log(formData);
      this.setSubmit(false)
      return;
    }
    fetch('api/register', {
      method: "POST",
      credentials: "include",
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      body: JSON.stringify(formData)
    }).then(res => res.json()
      .then(res => {
        console.log(res);
        this.setSubmit(false)
      }))
      .catch(err => {
        console.log(err);
        this.setSubmit(false);
      });
  }

  login(formData) {
    console.log('login');
    this.setState({ submitting: false });
    console.log(formData.password);
  }

  render() {
    let fields;
    if (this.state.isSignUp) {
      fields = <SignUpFields onSubmit={this.registerUser} submitting={this.state.submitting} />
    } else {
      fields = <LoginFields onSubmit={this.login} submitting={this.state.submitting} />
    }
    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="form-switch">
          <ToggleForm text='Sign Up' active={this.state.isSignUp} onClick={this.toSignUp} />
          <ToggleForm text='Log In' active={!this.state.isSignUp} onClick={this.toLogIn} />
        </div>
        {fields}
        <div className="form-group">
          <button className="form-control btn btn-primary" type="submit" onClick={this.submit}>
            Submit
     </button>
        </div>
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
  componentWillReceiveProps(newProps) {
    if (newProps.submitting !== this.props.submitting && newProps.submitting) {
      let hasError = this.validate();
      if (!hasError) {
        this.props.onSubmit(this.state);
      } 
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

    return isError
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
          floatingLabelFixed
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
          floatingLabelFixed
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
          floatingLabelFixed
          required
        />
      </React.Fragment>
    );
  }
}

class LoginFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      emailError: "",
      password: "",
      passwordError: "",
    }
  }
  componentWillReceiveProps(newProps) {
    if (newProps.submitting !== this.props.submitting && newProps.submitting) {
      let hasError = this.validate();
      if (!hasError) {
        this.props.onSubmit(this.state);
      } 
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

    return isError
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
          floatingLabelFixed
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
          floatingLabelFixed
          required
        />
      </React.Fragment>
    );
  }
}

export default RegisterForm