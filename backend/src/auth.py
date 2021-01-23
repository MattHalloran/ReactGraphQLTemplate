from functools import wraps
from flask import request, g, jsonify
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from itsdangerous import SignatureExpired, BadSignature
import os

TWO_WEEKS = 1209600
SECRET_KEY = os.environ.get("NLN_SIGN_KEY")


def generate_token(app, user, expiration=TWO_WEEKS):
    s = Serializer(SECRET_KEY, expires_in=expiration)
    token = s.dumps({
        'id': user.id,
        'email': user.personal_email[0].email_address,
    }).decode('utf-8')
    return token


def verify_token(app, token):
    s = Serializer(SECRET_KEY)
    try:
        data = s.loads(token)
    except (BadSignature, SignatureExpired):
        return None
    return data


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', None)
        if token:
            string_token = token.encode('ascii', 'ignore')
            user = verify_token(string_token)
            if user:
                g.current_user = user
                return f(*args, **kwargs)

        return jsonify(message="Authentication is required to access this resource"), 401

    return decorated
