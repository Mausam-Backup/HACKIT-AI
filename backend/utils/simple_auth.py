import base64
import hashlib
import hmac
import json
import secrets
import time
import io
from typing import Optional

import pyotp
import qrcode
import qrcode.image.svg

from fastapi import Request
from starlette.responses import Response

from utils.get_env import get_user_config_path_env, is_disable_auth_enabled, get_resend_api_key_env
from utils.user_config_store import read_user_config_file, update_user_config_file

SESSION_COOKIE_NAME = "presenton_session"
PBKDF2_ITERATIONS = 200_000
SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
AUTH_CONFIG_FIELDS = ("USERS", "PENDING_USERS", "AUTH_SECRET_KEY")


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(value: str) -> bytes:
    padded = value + "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(padded.encode("utf-8"))


def _load_user_config() -> dict:
    user_config_path = get_user_config_path_env()
    if not user_config_path:
        return {}

    try:
        return read_user_config_file(user_config_path)
    except Exception:
        return {}


def _save_user_config(config: dict, removed_keys: tuple[str, ...] = ()) -> None:
    user_config_path = get_user_config_path_env()
    if not user_config_path:
        raise ValueError("USER_CONFIG_PATH is not set")

    auth_config = {
        key: config[key]
        for key in AUTH_CONFIG_FIELDS
        if key in config
    }

    def merge_auth_config(existing: dict) -> dict:
        existing.update(auth_config)
        for key in removed_keys:
            existing.pop(key, None)
        return existing

    update_user_config_file(user_config_path, merge_auth_config)


def _hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )


def _encode_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = _hash_password(password, salt)
    salt_encoded = _base64url_encode(salt)
    digest_encoded = _base64url_encode(digest)
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_encoded}${digest_encoded}"
    )


def _verify_password_hash(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_encoded, digest_encoded = encoded_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        iterations = int(iterations_str)
        salt = _base64url_decode(salt_encoded)
        expected_digest = _base64url_decode(digest_encoded)
        actual_digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(actual_digest, expected_digest)
    except Exception:
        return False


def _get_or_create_auth_secret(config: dict) -> str:
    secret = config.get("AUTH_SECRET_KEY")
    if secret:
        return secret

    secret = _base64url_encode(secrets.token_bytes(32))
    config["AUTH_SECRET_KEY"] = secret
    _save_user_config(config)
    return secret


def is_auth_configured() -> bool:
    config = _load_user_config()
    users = config.get("USERS", {})
    return bool(users)


def get_configured_auth_username() -> Optional[str]:
    config = _load_user_config()
    users = config.get("USERS", {})
    if users:
        return list(users.keys())[0]
    return None


def setup_initial_credentials(username: str, password: str) -> dict:
    cleaned_username = (username or "").strip()
    if len(cleaned_username) < 3:
        raise ValueError("Username must be at least 3 characters")

    if len(password or "") < 6:
        raise ValueError("Password must be at least 6 characters")

    config = _load_user_config()
    users = config.setdefault("USERS", {})
    
    if cleaned_username in users:
        raise ValueError("Username already exists")

    resend_key = get_resend_api_key_env()
    if resend_key:
        import random
        import resend
        code = f"{random.randint(0, 999999):06d}"
        
        pending_users = config.setdefault("PENDING_USERS", {})
        pending_users[cleaned_username] = {
            "password_hash": _encode_password_hash(password),
            "verification_code": code
        }
        _save_user_config(config)
        
        resend.api_key = resend_key
        try:
            resend.Emails.send({
                "from": "no-reply <onboarding@resend.dev>",
                "to": cleaned_username,
                "subject": "Verify your Hack-It AI Account",
                "html": f"<h2>Verification Code</h2><p>Your one-time code is: <strong>{code}</strong></p>"
            })
        except Exception as e:
            raise ValueError(f"Failed to send email: {e}")
            
        return {"email_verification_required": True}

    users[cleaned_username] = {
        "password_hash": _encode_password_hash(password)
    }
    _get_or_create_auth_secret(config)
    _save_user_config(config)
    return {"email_verification_required": False}


def provision_judge_account() -> str:
    """Automatically provision a judge user so their token is valid in the multi-user system."""
    config = _load_user_config()
    users = config.setdefault("USERS", {})
    username = "Judge_Evaluator"
    
    if username not in users:
        users[username] = {
            "password_hash": "judge_bypass_no_hash"
        }
        _get_or_create_auth_secret(config)
        _save_user_config(config)
        
    return username


def verify_email_code(code: str) -> None:
    # Need to find which pending user has this code.
    config = _load_user_config()
    pending_users = config.get("PENDING_USERS", {})
    
    matched_username = None
    for uname, data in pending_users.items():
        if data.get("verification_code") == code.strip():
            matched_username = uname
            break
            
    if not matched_username:
        raise ValueError("Invalid verification code")
        
    users = config.setdefault("USERS", {})
    users[matched_username] = {
        "password_hash": pending_users[matched_username]["password_hash"]
    }
    
    del pending_users[matched_username]
    _get_or_create_auth_secret(config)
    _save_user_config(config)


def force_set_credentials(username: str, password: str) -> None:
    """Overwrite stored credentials; used by env-based preseed/override."""
    cleaned_username = (username or "").strip()
    if len(cleaned_username) < 3:
        raise ValueError("Username must be at least 3 characters")

    if len(password or "") < 6:
        raise ValueError("Password must be at least 6 characters")

    config = _load_user_config()
    users = config.setdefault("USERS", {})
    users[cleaned_username] = {
        "password_hash": _encode_password_hash(password)
    }
    
    # Rotate the signing secret so any previously-issued tokens stop validating.
    config["AUTH_SECRET_KEY"] = _base64url_encode(secrets.token_bytes(32))
    _save_user_config(config)


def clear_stored_credentials() -> None:
    """Remove stored credentials; next boot will request setup again."""
    config = _load_user_config()
    removed = False
    for key in AUTH_CONFIG_FIELDS:
        if key in config:
            config.pop(key, None)
            removed = True
    if removed:
        _save_user_config(config, removed_keys=AUTH_CONFIG_FIELDS)


def verify_credentials(username: str, password: str) -> bool:
    config = _load_user_config()
    users = config.get("USERS", {})
    
    cleaned_username = (username or "").strip()
    if cleaned_username not in users:
        return False

    stored_hash = users[cleaned_username].get("password_hash")
    if not stored_hash:
        return False

    return _verify_password_hash(password or "", stored_hash)


def is_2fa_configured(username: str) -> bool:
    config = _load_user_config()
    users = config.get("USERS", {})
    if username not in users:
        return False
    return bool(users[username].get("totp_secret"))


def generate_2fa_secret(username: str) -> dict:
    config = _load_user_config()
    users = config.get("USERS", {})
    if username not in users:
        raise ValueError("User not found")
        
    secret = pyotp.random_base32()
    users[username]["totp_secret"] = secret
    _save_user_config(config)
    
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name="Hack-It AI")
    
    factory = qrcode.image.svg.SvgPathImage
    img = qrcode.make(uri, image_factory=factory)
    stream = io.BytesIO()
    img.save(stream)
    svg_data = stream.getvalue().decode('utf-8')
    
    start_idx = svg_data.find("<svg")
    if start_idx != -1:
        svg_data = svg_data[start_idx:]
    
    return {"secret": secret, "qr_code_svg": svg_data}


def verify_2fa_code(username: str, code: str) -> bool:
    config = _load_user_config()
    users = config.get("USERS", {})
    if username not in users:
        return False
        
    secret = users[username].get("totp_secret")
    if not secret:
        return True
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


def disable_2fa(username: str) -> None:
    config = _load_user_config()
    users = config.get("USERS", {})
    if username in users and "totp_secret" in users[username]:
        users[username].pop("totp_secret")
        _save_user_config(config)


def _sign_payload(payload_encoded: str, secret: str) -> str:
    signature = hmac.new(
        secret.encode("utf-8"), payload_encoded.encode("utf-8"), hashlib.sha256
    ).digest()
    return _base64url_encode(signature)


def create_session_token(username: str) -> str:
    config = _load_user_config()
    secret = _get_or_create_auth_secret(config)

    issued_at = int(time.time())
    payload = {
        "v": 1,
        "u": username,
        "iat": issued_at,
        "exp": issued_at + SESSION_TTL_SECONDS,
    }

    payload_encoded = _base64url_encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signature_encoded = _sign_payload(payload_encoded, secret)
    return f"{payload_encoded}.{signature_encoded}"


def validate_session_token(token: Optional[str]) -> Optional[str]:
    if not token:
        return None

    config = _load_user_config()
    users = config.get("USERS", {})
    if not users:
        return None

    secret = config.get("AUTH_SECRET_KEY")
    if not secret:
        return None

    try:
        payload_encoded, signature_encoded = token.split(".", 1)
    except ValueError:
        return None

    expected_signature = _sign_payload(payload_encoded, secret)
    if not hmac.compare_digest(signature_encoded, expected_signature):
        return None

    try:
        payload_raw = _base64url_decode(payload_encoded)
        payload = json.loads(payload_raw)
    except Exception:
        return None

    username = payload.get("u")
    version = payload.get("v")
    expires_at = payload.get("exp")
    if not isinstance(username, str) or not isinstance(expires_at, int):
        return None

    if version != 1:
        return None

    if username not in users:
        return None

    if expires_at < int(time.time()):
        return None

    return username


def get_session_token_from_request(request: Request) -> Optional[str]:
    cookie_token = request.cookies.get(SESSION_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    auth_header = request.headers.get("Authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip() or None

    return None


def get_basic_auth_credentials_from_request(
    request: Request,
) -> Optional[tuple[str, str]]:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("basic "):
        return None

    encoded_value = auth_header[6:].strip()
    if not encoded_value:
        return None

    try:
        decoded_value = base64.b64decode(encoded_value).decode("utf-8")
    except Exception:
        return None

    if ":" not in decoded_value:
        return None

    username, password = decoded_value.split(":", 1)
    return username, password


def get_auth_status(session_token: Optional[str] = None) -> dict:
    config = _load_user_config()
    configured = is_auth_configured()

    if not configured:
        return {
            "configured": False,
            "authenticated": False,
            "username": None,
        }

    username = validate_session_token(session_token)
    return {
        "configured": True,
        "authenticated": bool(username),
        "username": username,
        "2fa_enabled": is_2fa_configured(username) if username else False,
    }


def get_internal_auth_headers() -> dict[str, str]:
    """Return auth headers for trusted same-host service-to-service API calls."""
    if is_disable_auth_enabled():
        return {}

    username = get_configured_auth_username()
    if not username:
        return {}

    return {"Authorization": f"Bearer {create_session_token(username)}"}


def _is_secure_request(request: Request) -> bool:
    forwarded_proto = request.headers.get("x-forwarded-proto", "")
    if forwarded_proto.lower() == "https":
        return True
    return request.url.scheme == "https"


def set_session_cookie(response: Response, token: str, request: Request) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=_is_secure_request(request),
        samesite="lax",
        path="/",
    )


def clear_session_cookie(response: Response, request: Request) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        secure=_is_secure_request(request),
        samesite="lax",
        path="/",
    )
