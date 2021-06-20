export const CODE = {
    NoResults: {
        code: 485,
        message: 'Warning: Called successfully, but got no results'
    },
    SomeImagesAlreadyUploaded: {
        code: 489,
        message: 'Warning: Some images were already uploaded'
    },
    ErrorUnknown: {
        code: 435,
        message: 'Unknown error occurred'
    },
    InvalidArgs: {
        code: 423,
        message: 'Error: Invalid arguments supplied'
    },
    PhoneInUse: {
        code: 452,
        message: 'Error: Account with that phone number already exists'
    },
    EmailInUse: {
        code: 469,
        message: 'Error: Account with that email already exists'
    },
    EmailNotVerified: {
        code: 457,
        message: 'Error: Email has not been verified yet. Sending new verification email'
    },
    NoUser: {
        code: 468,
        message: 'Error: No user with that email'
    },
    BadCredentials: {
        code: 475,
        message: 'Error: Email or password incorrect'
    },
    SoftLockout: {
        code: 410,
        message: 'Error: Too many login attempts. Try again in 15 minutes'
    },
    HardLockout: {
        code: 412,
        message: 'Error: Account locked. Contact us for assistance'
    },
    NotVerified: {
        code: 424,
        message: 'Error: Session token could not be verified. Please log back in'
    },
    Unauthorized: {
        code: 425,
        message: 'Error: Not authorized to perform this action'
    },
    CannotDeleteYourself: {
        code: 426,
        message: 'Error: What are you doing trying to delete your own account? I am disappointed :('
    },
    NotImplemented: {
        code: 427,
        message: 'Error: This has not been implemented yet. Please be patient :)'
    }
}